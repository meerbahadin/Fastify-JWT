const fastify = require("fastify")();
const fastifyEnv = require("fastify-env");

const schema = {
  type: "object",
  required: ["PORT"],
  properties: {
    PORT: {
      type: "string",
      default: process.env.PORT || 3000,
    },
  },
};

const options = {
  schema: schema,
  data: process.env,
  dotenv: true,
};

fastify.register(fastifyEnv, options).after(() => {
  fastify.register(require("./utils/db"), {
    useUnifiedTopology: true,
    url: process.env.MONGO_URL,
  });
});

fastify.get("/", function (request, reply) {
  reply.send("API RUNNING");
});

fastify.register(require("./routes/auth"));

//Server Creation
fastify.listen(
  process.env.PORT || 3000,
  process.env.HOST || "::",
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
  }
);
