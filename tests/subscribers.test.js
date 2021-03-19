const { Subscriber } = require("../src/models");
const { expect } = require("chai");
const request = require("supertest");
const app = require("../src/app");

describe("/subscribers", () => {
  before(async () => {
    try {
      await Subscriber.sequelize.sync();
    } catch (err) {
      console.log(err);
    }
  });

  beforeEach(async () => {
    try {
      await Subscriber.destroy({ where: {} });
    } catch (err) {
      console.log(err);
    }
  });

  describe("POST /add-subscriber", async () => {
    it("creates a new subscriber in the database", async () => {
      const response = await request(app).post("/add-subscriber").send({
        phone: "+447724285660",
        subscribed: true,
      });

      await expect(response.status).to.equal(201);
      expect(response.body.phone).to.equal("+447724285660");
      expect(response.body.subscribed).to.be.true;

      const newSubscriberRecord = await Subscriber.findByPk(response.body.id, {
        raw: true,
      });

      expect(newSubscriberRecord.phone).to.equal("+447724285660");
      expect(newSubscriberRecord.subscribed).to.equal(1);
    });
  });

  describe("with subscribers in the database", () => {
    let subscribers;
    beforeEach((done) => {
      Promise.all([
        Subscriber.create({ phone: "+441234567891", subscribed: true }),
        Subscriber.create({ phone: "+441234567890", subscribed: true }),
        Subscriber.create({ phone: "+441234567892", subscribed: true }),
      ]).then((documents) => {
        subscribers = documents;
        done();
      });
    });

    describe("GET /subscribers", () => {
      it("gets all subscriber records", (done) => {
        request(app)
          .get("/subscribers")
          .then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(3);
            res.body.forEach((subscriber) => {
              const expected = subscribers.find((a) => a.id === subscriber.id);
              expect(subscriber.phone).to.equal(expected.phone);
              expect(subscriber.subscribed).to.equal(expected.subscribed);
            });
            done();
          })
          .catch((error) => done(error));
      });
    });

    describe("PATCH /subscribers/:id", () => {
      it("updates subscriber phone number by id", (done) => {
        const subscriber = subscribers[0];
        request(app)
          .patch(`/subscribers/${subscriber.id}`)
          .send({ phone: "+4470987654321" })
          .then((res) => {
            expect(res.status).to.equal(200);
            Subscriber.findByPk(subscriber.id, { raw: true }).then(
              (updatedSubscriber) => {
                expect(updatedSubscriber.phone).to.equal("+4470987654321");
                done();
              }
            );
          })
          .catch((error) => done(error));
      });

      it("updates subscriber's 'subscribed' status by id", (done) => {
        const subscriber = subscribers[0];
        request(app)
          .patch(`/subscribers/${subscriber.id}`)
          .send({ subscribed: false })
          .then((res) => {
            expect(res.status).to.equal(200);
            Subscriber.findByPk(subscriber.id, { raw: true }).then(
              (updatedSubscriber) => {
                expect(updatedSubscriber.subscribed).to.equal(0);
                done();
              }
            );
          });
      });

      it("returns a 404 if the subscriber does not exist", (done) => {
        request(app)
          .patch("/subscribers/12345")
          .send({ phone: "+447777777777" })
          .then((res) => {
            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal("The subscriber does not exist.");
            done();
          })
          .catch((error) => done(error));
      });
    });

    describe("DELETE /subscribers/:id", () => {
      it("deletes subscriber record by id", (done) => {
        const subscriber = subscribers[0];
        request(app)
          .delete(`/subscribers/${subscriber.id}`)
          .then((res) => {
            expect(res.status).to.equal(204);
            Subscriber.findByPk(subscriber.id, { raw: true }).then(
              (updatedSubscriber) => {
                expect(updatedSubscriber).to.equal(null);
                done();
              }
            );
          })
          .catch((error) => done(error));
      });

      it("returns a 404 if the subscriber does not exist", (done) => {
        request(app)
          .delete("/subscribers/345")
          .then((res) => {
            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal("The subscriber does not exist.");
            done();
          })
          .catch((error) => done(error));
      });
    });
  });
});
