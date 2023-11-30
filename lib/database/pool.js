const { promisify } = require("util");
const config = require("../../config/mysql.config.js");
const mysql = require("mysql");

// MySQL接続プールを作成
const pool = mysql.createPool({
  host: config.HOST,
  port: config.PORT,
  user: config.USERNAME,
  password: config.PASSWORD,
  database: config.DATABASE,
  connectionLimit: config.CONNECTION_LIMIT,
  queueLimit: config.QUEUE_LIMIT
});

/**
 * MySQL接続プールと関連メソッドをエクスポートする
 * @typedef {Object} DatabaseModule
 * @property {Object} pool - MySQL接続プール
 * @property {Function} getConnection - MySQL接続をプロミス化した関数
 * @property {Function} executeQuery - MySQLクエリをプロミス化した関数
 * @property {Function} releaseConnection - MySQL接続のリリースを行う関数
 * @property {Function} end - MySQL接続プールの終了をプロミス化した関数
 */

/**
 * MySQL接続プールと関連メソッドをエクスポートする
 * @type {DatabaseModule}
 */
module.exports = {
  pool,
  getConnection: promisify(pool.getConnection).bind(pool),
  executeQuery: promisify(pool.query).bind(pool),

  /**
   * MySQL接続をリリースする関数
   * @param {Object} connection - リリースするMySQL接続オブジェクト
   */
  releaseConnection: function (connection) {
    connection.release();
  },

  /**
   * MySQL接続プールを終了する関数
   * @type {Function}
   */
  end: promisify(pool.end).bind(pool)
};
