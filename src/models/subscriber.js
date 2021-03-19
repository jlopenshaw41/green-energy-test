module.exports = (connection, DataTypes) => {
    const schema = {
      phone: DataTypes.STRING,
      subscribed: DataTypes.BOOLEAN,
    };
  
    const SubscriberModel = connection.define("Subscriber", schema);
    return SubscriberModel;
  };
  