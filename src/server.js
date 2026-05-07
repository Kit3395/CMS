const app = require("./app");
const { port } = require("./config");

app.listen(port, () => {
  console.log(`CASA MIRA API running on port ${port}`);
});
