const fastify = require("fastify")();

fastify.register(require("./utils/db"), {
  useUnifiedTopology: true,
  url: "mongodb+srv://meer:AWYwHSXaQRfdXIhM@cluster0.pmapc.mongodb.net/jwt-auth",
});

fastify.get("/", function (request, reply) {
  reply.send("API RUNNING");
});

fastify.register(require("./routes/auth"));

//Server Creation
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});

