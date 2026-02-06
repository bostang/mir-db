const sql = require('msnodesqlv8');

const connectionString = "server=IFM-70556-293D;Database=mim_db;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server}";

module.exports = {
    query: (text, params, callback) => {
        return sql.query(connectionString, text, params, callback);
    },
    connectionString // Export string jika diperlukan helper langsung
};