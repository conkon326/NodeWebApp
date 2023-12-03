// データベース接続プールのインスタンスをインポート
const pool = require("./pool.js");

// トランザクションクラスの定義
var Transaction = class {
  // コンストラクター
  constructor(connection) {
    // トランザクションが既に開始されている場合は、リリースしてから新しい接続を確立
    if (this.connection) {
      this.connection.release();
    }
    this.connection = connection;
  }

  // トランザクションの開始
  async begin() {
    // 既存の接続があれば解放して新しい接続を確立
    if (this.connection) {
      this.connection.release();
    }
    this.connection = await pool.getConnection();
    this.connection.beginTransaction();
  }

  // クエリの実行
  async executeQuery(query, values, options = {}) {
    options = {
      fields: options.fields || false
    };
    return new Promise((resolve, reject) => {
      this.connection.query(query, values, (err, results, fields) => {
        // エラーがない場合は結果を解決し、エラーがあれば拒否
        if (!err) {
          resolve(options.fields ? results : { results, fields });
        } else {
          reject(err);
        }
      });
    });
  }

  // トランザクションのコミット
  async commit() {
    return new Promise((resolve, reject) => {
      this.connection.commit((err) => {
        // コミット後に接続を解放し、nullに設定
        this.connection.release();
        this.connection = null;
        // エラーがない場合は解決し、エラーがあれば拒否
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }

  // トランザクションのロールバック
  async rollback() {
    return new Promise((resolve, reject) => {
      this.connection.rollback(() => {
        // ロールバック後に接続を解放し、nullに設定
        this.connection.release();
        this.connection = null;
        // 解決処理
        resolve();
      });
    });
  }
};

// モジュールとしてエクスポート
module.exports = Transaction;
