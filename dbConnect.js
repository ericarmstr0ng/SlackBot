const { Client } = require('pg');

//Please use connection string like below
//const connString = "server=192.168.2.109,64883;Database=insights;Uid=sa;Pwd=Admin@123;Driver={SQL Server Native Client 11.0}";
//sconst selQuery = "SELECT name FROM ProjectStatus";

//insert query block


exports.dbInsert = function dbinsert(connString,insQuery,escapeValue=""){
  const client = new Client({
    connectionString: connString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  client.connect();
  //query exexution block
  insQuery = String(insQuery).replace("replaceText",client.escapeLiteral(escapeValue))
  console.log(insQuery)
  client.query(insQuery, (err, res) => {
    if (err) throw err;
    /*for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }*/
    client.end();
  });

}
