class TableController {
    constructor(db) {
        this.db = db;
    }

    async getTables(req, res) {
        const { user_id } = req.query;
        const client = await this.db.connect();
        try {
            const tables = await client.query(
                `select * from tables_list where user_id = $1;`,
                [user_id]
            );
            res.status(201).json(tables.rows);
        } catch (error) {
            console.error(error);
        } finally {
            client.release();
        }
    }

    async updateTableName(req, res) {
        const { old_table_name, new_table_name } = req.body;
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            await client.query(`ALTER TABLE ${old_table_name} RENAME TO ${new_table_name};`);
            await client.query(`UPDATE Tables_list SET table_name=$1 WHERE table_name=$2`, [new_table_name, old_table_name]);

            await client.query('COMMIT');
            res.send('Имя таблицы успешно изменено');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Ошибка при изменении данных', err);

            if (err.code === '42P07') {
                res.status(400).json({ error: `Таблица с именем '${new_table_name}' уже существует.` });
            } else {
                res.status(500).json({ error: 'Не удалось изменить данные. Попробуйте позже' });
            }
        } finally {
            client.release();
        }
    }

    async removeTable(req, res) {
        const { table_name } = req.query;
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            await client.query(`DROP TABLE "${table_name}"`);
            await client.query(`DELETE FROM Tables_list WHERE table_name=$1`, [table_name]);

            await client.query('COMMIT');
            res.send('Таблица удалена');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Ошибка при удалении данных', err);
            res.status(500).json({ error: 'Не удалось удалить данные. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async addColumn(req, res) {
        const { table_name, column_name, column_type } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`ALTER TABLE ${table_name} ADD COLUMN ${column_name} ${column_type}`);
            res.send(`Колонка ${column_name} успешно добавлена в таблицу ${table_name}`);
        } catch (err) {
            console.error('Ошибка при добавлении колонки', err);
            res.status(500).json({ error: 'Не удалось добавить колонку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async removeColumn(req, res) {
        const { table_name, column_name } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`ALTER TABLE ${table_name} DROP COLUMN ${column_name}`);
            res.send(`Колонка ${column_name} успешно удалена из таблицы ${table_name}`);
        } catch (err) {
            console.error('Ошибка при удалении колонки', err);
            res.status(500).json({ error: 'Не удалось удалить колонку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async updateColumnType(req, res) {
        const { table_name, column_name, new_column_type } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`ALTER TABLE ${table_name} ALTER COLUMN ${column_name} SET DATA TYPE ${new_column_type} USING ${column_name}::${new_column_type};`);
            res.send(`Тип данных успешно изменен`);
        } catch (err) {
            console.error('Ошибка при изменений типа данных', err);
            if (err.code === '42P01') {
                res.status(404).json({ error: 'Таблица не найдена.' });
            } else if (err.code === '42703') {
                res.status(404).json({ error: 'Колонка не найдена.' });
            }
            else if (err.code === '42804') {
                res.status(400).json({ error: `Не удалось изменить тип данных: несовместимый тип для преобразования ${column_name} в ${new_column_type}.` });
            } else {
                res.status(500).json({ error: 'Не удалось изменить тип данных. Попробуйте позже' });
            }
        } finally {
            client.release();
        }
    }

    async addRow(req, res) {
        const { table_name } = req.body;
        const client = await this.db.connect();

        try {
            const newRow = await client.query(`INSERT INTO ${table_name} DEFAULT VALUES RETURNING id;`);
            res.send(`Новая строка ${newRow.rows[0].id}`);
        } catch (err) {
            console.error('Ошибка при добавлении строки', err);
            res.status(500).json({ error: 'Не удалось добавить строку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async addRow(req, res) {
        const { table_name } = req.body;
        const client = await this.db.connect();

        try {
            const newRow = await client.query(`INSERT INTO ${table_name} DEFAULT VALUES RETURNING id;`);
            res.send(`Новая строка ${newRow.rows[0].id}`);
        } catch (err) {
            console.error('Ошибка при добавлении строки', err);
            res.status(500).json({ error: 'Не удалось добавить строку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }

    async updateCell(req, res) {
        const { table_name, column_name, row_id, new_value } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`UPDATE ${table_name} SET ${column_name}=$1 WHERE id=$2`, [new_value, row_id]);
            res.send(`Ячейка ${column_name} ${row_id} обновлена`);
        } catch (err) {
            console.error('Ошибка при обновлении ячейки', err);
            if (err.code === '42P01') {
                res.status(404).json({ error: 'Таблица не найдена.' });
            } else if (err.code === '42703') {
                res.status(404).json({ error: 'Колонка не найдена.' });
            } else {
                res.status(500).json({ error: 'Не удалось обновить ячейку. Попробуйте позже' });
            }
        } finally {
            client.release();
        }
    }

    async removeRow(req, res) {
        const { table_name, row_id } = req.body;
        const client = await this.db.connect();

        try {
            await client.query(`DELETE FROM ${table_name} WHERE id=$1`, [row_id]);
            res.send(`Строка удалена`);
        } catch(err) {
            console.error('Ошибка при удалении строки ячейки', err);
            res.status(500).json({ error: 'Не удалось удалить строку. Попробуйте позже' });
        } finally {
            client.release();
        }
    }
}

module.exports = TableController;