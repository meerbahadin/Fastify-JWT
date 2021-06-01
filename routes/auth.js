const bcrypt = require("bcrypt");

async function routes(fastify, options) {
  fastify.register(require("fastify-jwt"), {
    secret: process.env.JWT_SECERET,
    public: process.env.PUBLIC_KEY,
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  //Auth Route
  //@Public
  fastify.post("/user/register", async (request, replay) => {
    const db = fastify.mongo.db("db");
    const collection = db.collection("user");

    const { email, password } = request.body;

    if (!email || !password)
      return replay.code(403).send({ message: "Email & Password required" });

    if (password.length < 6)
      return replay
        .code(403)
        .send({ message: "Password length must be more than 6 character" });

    let isUserExist = await collection.findOne({ email });

    if (isUserExist)
      return replay.code(409).send({ message: "User already exist" });
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      let data = await collection.insertOne({
        email,
        password: hashedPassword,
      });
      const { _id, email: userEmail } = data.ops[0];
      const token = fastify.jwt.sign({ _id, userEmail });
      replay.code(200).send({ token, _id, userEmail });
    } catch (error) {
      console.log(error);
      replay.code(500).send("Server Error");
    }
  });

  //@Public
  fastify.post("/user/login", async (request, replay) => {
    const db = fastify.mongo.db("db");
    const collection = db.collection("user");

    const { email, password } = request.body;

    let user = await collection.findOne({ email });

    if (!user) return replay.code(409).send({ message: "Invalid Credentails" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return replay.code(409).send({ message: "Invalid Credentails" });

    const { _id, email: userEmail } = user;
    const token = fastify.jwt.sign({ _id, userEmail }, { expiresIn: 3600 });
    replay.code(200).send({ token, _id, userEmail });

    try {
    } catch (error) {
      replay.code(500).send("Server Error");
    }
  });

  //@Private
  fastify.get(
    "/user/auth",
    { preHandler: [fastify.authenticate] },
    async (request, replay) => {
      replay.code(200).send(request.user);
    }
  );
}

module.exports = routes;
