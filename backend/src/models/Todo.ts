import { db } from '../config/database';

export interface Todo {
  id: number;
  text: string;
  status: 'TODO' | 'PROGRESS' | 'DONE';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface TodoWithAssignees extends Todo {
  assignees: Array<{
    id: number;
    name: string;
    username: string;
  }>;
  created_by_name: string;
}

export interface TodoAssignee {
  id: number;
  todo_id: number;
  user_id: number;
  assigned_at: string;
}

export class TodoModel {
  static async create(text: string, status: 'TODO' | 'PROGRESS' | 'DONE', createdBy: number, assigneeIds: number[]): Promise<number> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        db.run(
          'INSERT INTO todos (text, status, created_by) VALUES (?, ?, ?)',
          [text, status, createdBy],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            const todoId = this.lastID;
            
            const stmt = db.prepare('INSERT INTO todo_assignees (todo_id, user_id) VALUES (?, ?)');
            let completedInserts = 0;
            let hasError = false;

            assigneeIds.forEach(userId => {
              stmt.run(todoId, userId, (err: any) => {
                if (err && !hasError) {
                  hasError = true;
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                completedInserts++;
                if (completedInserts === assigneeIds.length && !hasError) {
                  stmt.finalize();
                  db.run('COMMIT');
                  resolve(todoId);
                }
              });
            });
          }
        );
      });
    });
  }

  static async getAll(): Promise<TodoWithAssignees[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          t.id, t.text, t.status, t.created_by, t.created_at, t.updated_at,
          u.name as created_by_name,
          GROUP_CONCAT(au.id || ':' || au.name || ':' || au.username) as assignees_data
        FROM todos t
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN todo_assignees ta ON t.id = ta.todo_id
        LEFT JOIN users au ON ta.user_id = au.id
        GROUP BY t.id, t.text, t.status, t.created_by, t.created_at, t.updated_at, u.name
        ORDER BY t.created_at DESC
      `;

      db.all(query, [], (err: any, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const todos = rows.map(row => ({
            id: row.id,
            text: row.text,
            status: row.status,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by_name: row.created_by_name || '',
            assignees: row.assignees_data 
              ? row.assignees_data.split(',').map((assigneeData: string) => {
                  const [id, name, username] = assigneeData.split(':');
                  return { id: parseInt(id || '0'), name: name || '', username: username || '' };
                })
              : []
          }));
          resolve(todos);
        }
      });
    });
  }

  static async getById(id: number): Promise<TodoWithAssignees | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          t.id, t.text, t.status, t.created_by, t.created_at, t.updated_at,
          u.name as created_by_name,
          GROUP_CONCAT(au.id || ':' || au.name || ':' || au.username) as assignees_data
        FROM todos t
        LEFT JOIN users u ON t.created_by = u.id
        LEFT JOIN todo_assignees ta ON t.id = ta.todo_id
        LEFT JOIN users au ON ta.user_id = au.id
        WHERE t.id = ?
        GROUP BY t.id, t.text, t.status, t.created_by, t.created_at, t.updated_at, u.name
      `;

      db.get(query, [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const todo = {
            id: row.id,
            text: row.text,
            status: row.status,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by_name: row.created_by_name || '',
            assignees: row.assignees_data 
              ? row.assignees_data.split(',').map((assigneeData: string) => {
                  const [id, name, username] = assigneeData.split(':');
                  return { id: parseInt(id || '0'), name: name || '', username: username || '' };
                })
              : []
          };
          resolve(todo);
        }
      });
    });
  }

  static async updateStatus(id: number, status: 'TODO' | 'PROGRESS' | 'DONE'): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE todos SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  static async update(id: number, text?: string, status?: 'TODO' | 'PROGRESS' | 'DONE', assigneeIds?: number[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const updates: string[] = [];
        const values: any[] = [];

        if (text !== undefined) {
          updates.push('text = ?');
          values.push(text);
        }

        if (status !== undefined) {
          updates.push('status = ?');
          values.push(status);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        if (updates.length > 1) {
          db.run(
            `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
            values,
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              if (assigneeIds !== undefined) {
                db.run('DELETE FROM todo_assignees WHERE todo_id = ?', [id], (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }

                  const stmt = db.prepare('INSERT INTO todo_assignees (todo_id, user_id) VALUES (?, ?)');
                  let completedInserts = 0;
                  let hasError = false;

                  if (assigneeIds.length === 0) {
                    stmt.finalize();
                    db.run('COMMIT');
                    resolve(true);
                    return;
                  }

                  assigneeIds.forEach(userId => {
                    stmt.run(id, userId, (err: any) => {
                      if (err && !hasError) {
                        hasError = true;
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                      }
                      
                      completedInserts++;
                      if (completedInserts === assigneeIds.length && !hasError) {
                        stmt.finalize();
                        db.run('COMMIT');
                        resolve(true);
                      }
                    });
                  });
                });
              } else {
                db.run('COMMIT');
                resolve(true);
              }
            }
          );
        } else if (assigneeIds !== undefined) {
          db.run('DELETE FROM todo_assignees WHERE todo_id = ?', [id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            const stmt = db.prepare('INSERT INTO todo_assignees (todo_id, user_id) VALUES (?, ?)');
            let completedInserts = 0;
            let hasError = false;

            if (assigneeIds.length === 0) {
              stmt.finalize();
              db.run('COMMIT');
              resolve(true);
              return;
            }

            assigneeIds.forEach(userId => {
              stmt.run(id, userId, (err: any) => {
                if (err && !hasError) {
                  hasError = true;
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                
                completedInserts++;
                if (completedInserts === assigneeIds.length && !hasError) {
                  stmt.finalize();
                  db.run('COMMIT');
                  resolve(true);
                }
              });
            });
          });
        } else {
          db.run('COMMIT');
          resolve(false);
        }
      });
    });
  }

  static async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}