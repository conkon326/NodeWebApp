const path = require("path");
// @garafu/mysql-fileloaderからsqlオブジェクトを読み込む
const { sql } = require("@garafu/mysql-fileloader")({ root: path.join(__dirname, "./sql") });

// 別のモジュールからMySQL接続プールを取り込む
const pool = require("./pool");

// 別のモジュールからトランザクションクラスを取り込む
const Transaction = require("./transaction");

/**
 * MySQLクエリを実行するクライアントオブジェクト
 * @typedef {Object} MySQLClient
 * @property {Function} executeQuery - MySQLクエリを実行する関数
 * @property {Function} beginTransaction - トランザクションを開始する関数
 */

/**
 * MySQLファイルローダーから読み込んだSQLオブジェクトとMySQL接続プールをエクスポートする
 * @typedef {Object} DatabaseModule
 * @property {MySQLClient} MySQLClient - MySQLクエリを実行するクライアントオブジェクト
 * @property {Object} sql - MySQLファイルローダーから読み込んだSQLオブジェクト
 */

/**
 * MySQLクエリを実行するクライアントオブジェクト
 * @type {MySQLClient}
 */
const MySQLClient = {
  /**
   * MySQLクエリを実行する関数
   * @param {string} query - 実行するSQLクエリ
   * @param {Array} values - クエリのプレースホルダに挿入する値の配列
   * @returns {Promise} - クエリの実行結果のプロミス
   */
  executeQuery: async function (query, values) {
    // 別のモジュールから取り込んだプールを使用してクエリを実行
    var results = await pool.executeQuery(query, values);
    return results;
  },
  /**
   * トランザクションを開始する関数
   * @returns {Promise<Transaction>} - トランザクションのプロミス
   */
  beginTransaction: async function () {
    // 新しいトランザクションインスタンスを作成し、開始
    var tran = new Transaction();
    await tran.begin();
    return tran;
  }
};

/**
 * MySQLファイルローダーから読み込んだSQLオブジェクトとMySQL接続プールをエクスポートする
 * @type {DatabaseModule}
 */
module.exports = {
  MySQLClient,
  sql
};
