const Option = require("../models/Option.js");
const { emitNewOption } = require("./websocketController");
// Add options (array input)
const addOptions = async (req, reply) => {
  try {
    const { field, value } = req.body;

    const validFields = ["potency", "repetition", "dosage", "days", "unit"];
    if (!validFields.includes(field)) {
      return reply.code(400).send({ message: "Invalid field name" });
    }

    // Normalize input → always array
    const valuesArray = Array.isArray(value)
      ? value.map((v) => v.trim()).filter((v) => v)
      : value.split(",").map((v) => v.trim()).filter((v) => v);

    let option = await Option.findOne();

    if (option) {
      const existingValues = new Set(option[field] || []);
      const newValues = valuesArray.filter((v) => !existingValues.has(v));

      if (newValues.length > 0) {
        option[field] = [...option[field], ...newValues];
        await option.save();
      }
      emitNewOption(option)
      return reply.code(200).send({
        message: `${field} options updated`,
        data: option,
      });
    } else {
      const option = await Option.create({ [field]: valuesArray });
       emitNewOption(option)
      return reply.code(201).send({
        message: `${field} created with options`,
        data: option,
      });
    }
  } catch (err) {
    reply.code(500).send({
      message: "Failed to update option",
      error: err.message,
    });
  }
};

// Get all options
const getAllOptions = async (req, reply) => {
  try {
    const options = await Option.findAll({
      order: [["createdAt", "DESC"]],
    });
    reply.code(200).send(options);
  } catch (err) {
    reply.code(500).send({
      message: "Failed to fetch options",
      error: err.message,
    });
  }
};

// Delete option by field + index
const deleteOptionByField = async (req, reply) => {
  try {
    const { field, index } = req.body;

    const validFields = ["potency", "repetition", "dosage", "days", "unit"];
    if (!validFields.includes(field)) {
      return reply.code(400).send({ message: "Invalid field specified" });
    }

    const option = await Option.findOne();

    if (!option || !Array.isArray(option[field])) {
      return reply.code(404).send({ message: "Option field not found" });
    }

    if (index < 0 || index >= option[field].length) {
      return reply.code(400).send({ message: "Invalid index" });
    }

    const updatedArray = [...option[field]];
    updatedArray.splice(index, 1);

    option[field] = updatedArray;
    await option.save();

    reply.code(200).send({
      message: `Deleted item at index ${index} from '${field}'`,
      data: option[field],
    });
  } catch (err) {
    reply.code(500).send({
      message: "Failed to delete option by index",
      error: err.message,
    });
  }
};

module.exports = {
  addOptions,
  getAllOptions,
  deleteOptionByField,
};
