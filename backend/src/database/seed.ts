import Connection from "./Connection";
import seeder from "./Seeder";

const connection = Connection.default();

connection.then(() => {
  Promise.all([
    seeder.sanitize(),
    seeder.seed(),
  ])
    .then(() => process.exit());

});
