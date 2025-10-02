const SuperRemedies = require("../models/AdminRemedies");
const { emitNewRemedy } = require("./websocketController");
// Add Remedy
const addRemedy = async (request, reply) => {
  try {
    const { remediesName } = request.body;
    if (!remediesName) {
      return reply.code(400).send({ message: "Remedy name is required." });
    }

    // Check duplicate
    const existingRemedy = await SuperRemedies.findOne({
      where: { remediesName: remediesName.trim().toUpperCase() },
    });

    if (existingRemedy) {
      return reply
        .code(409)
        .send({ message: "Remedy with the same name already exists." });
    }

    const newRemedy = await SuperRemedies.create({
      remediesName: remediesName.trim().toUpperCase(),
    });
    emitNewRemedy(newRemedy)
    return reply.code(201).send({
      message: "Remedy added successfully",
      data: newRemedy,
    });
  } catch (error) {
    return reply.code(500).send({ message: "Error adding remedy", error });
  }
};
const remedies = [
  { remediesName: "Bio-Combination No.10" },
  { remediesName: "Bio-Combination No.11" },
  { remediesName: "Bio-Combination No.12" },
  { remediesName: "Bio-Combination No.13" },
  { remediesName: "Bio-Combination No.14" },
  { remediesName: "Bio-Combination No.15" },
  { remediesName: "Bio-Combination No.16" },
  { remediesName: "Bio-Combination No.17" },
  { remediesName: "Bio-Combination No.18" },
  { remediesName: "Bio-Combination No.19" },
  { remediesName: "Bio-Combination No.2" },
  { remediesName: "Bio-Combination No.20" },
  { remediesName: "Bio-Combination No.21" },
  { remediesName: "Bio-Combination No.22" },
  { remediesName: "Bio-Combination No.23" },
  { remediesName: "Bio-Combination No.24" },
  { remediesName: "Bio-Combination No.25" },
  { remediesName: "Bio-Combination No.26" },
  { remediesName: "Bio-Combination No.27" },
  { remediesName: "Bio-Combination No.28" },
  { remediesName: "Bio-Combination No.3" },
  { remediesName: "Bio-Combination No.4" },
  { remediesName: "Bio-Combination No.5" },
  { remediesName: "Bio-Combination No.6" },
  { remediesName: "Bio-Combination No.7" },
  { remediesName: "Bio-Combination No.8" },
  { remediesName: "Bio-Combination No.9" },
  { remediesName: "Bismuthum Metallicum" },
  { remediesName: "Bismuthum Oxydatum" },
  { remediesName: "Bismuthum Sub-Nitricum" },
  { remediesName: "Blatta Orientalis" },
  { remediesName: "Boerhaavia  Diffusa" },
  { remediesName: "Boerhaavia Diffusa" },
  { remediesName: "Boldo" },
  { remediesName: "Borax" },
  { remediesName: "Bothrops Lanceolatus" },
  { remediesName: "Bovista" },
  { remediesName: "Bromium" },
  { remediesName: "Brucinum" },
  { remediesName: "Bryonia Alba" },
  { remediesName: "Bryophyllum Calycinum" },
  { remediesName: "Bufo Rana" },
  { remediesName: "Cactus Grandiflorus" },
  { remediesName: "Cadmium Arsencicum" },
  { remediesName: "Cadmium Arsenicosum" },
  { remediesName: "Cadmium Fluoratum" },
  { remediesName: "Cadmium Iodatum" },
  { remediesName: "Cadmium Metallicum" },
  { remediesName: "Cadmium Phosphoricum" },
  { remediesName: "Cadmium Sulphuratum" },
  { remediesName: "Cadmium Suphuricum" },
  { remediesName: "Caesalpinia Bonducella" },
  { remediesName: "Caffeinum" },
  { remediesName: "Cajuputum" },
  { remediesName: "Caladium Seguinum" },
  { remediesName: "Calcarea  Arsenicica" },
  { remediesName: "Calcarea Acetica" },
  { remediesName: "Calcarea Arsenicosa" },
  { remediesName: "Calcarea Bromata" },
  { remediesName: "Calcarea Carbonica" },
  { remediesName: "Calcarea Caustica" },
  { remediesName: "Calcarea Fluorica" },
  { remediesName: "Calcarea Hypophosphorosa" },
  { remediesName: "Calcarea Iodata" },
  { remediesName: "Calcarea Muriatica" },
  { remediesName: "Calcarea Ova Tosta" },
  { remediesName: "Calcarea Oxalica" },
  { remediesName: "Calcarea Phosphorica" },
  { remediesName: "Calcarea Picrata" },
  { remediesName: "Calcarea Silicata" },
  { remediesName: "Calcarea Sulphurica" },
  { remediesName: "Calculi Biliarii" },
  { remediesName: "Calendula Officinalis" },
  { remediesName: "Calotropis Gigantea" },
  { remediesName: "Caltha Paustris" },
  { remediesName: "Camphora" },
  { remediesName: "Camphora Monobromata" },
  { remediesName: "Cannabis Indica" },
  { remediesName: "Cannabis Sativa" },
  { remediesName: "Cantharis" },
  { remediesName: "Capsicum Annum" },
  { remediesName: "Carbo Animalis" },
  { remediesName: "Carbo Vegetabilis" },
  { remediesName: "Carboneum Oxygenisatum" },
  { remediesName: "Carboneum Sulphuratum" },
  { remediesName: "Carcino Adeno Stomach" },
  { remediesName: "Carcino Sc Mammae" },
  { remediesName: "Carcinoma Adeno Pap Colon" },
  { remediesName: "Carcinosin" },
  { remediesName: "Carcinosin Mix" },
  { remediesName: "Carcinosin Squam. Pulm" },
  { remediesName: "Cardiospermum Helicacabum" },
  { remediesName: "Carduus Benedictus" },
  { remediesName: "Carduus Marianus" },
  { remediesName: "Carica Papaya" },
  { remediesName: "Carlsbad" },
  { remediesName: "Carum Carvi" },
  { remediesName: "Cascara Sagrada" },
  { remediesName: "Cascarilla" },
  { remediesName: "Cassia Fistula" },
  { remediesName: "Cassia Sophera" },
  { remediesName: "Cassis Sophera" },
  { remediesName: "Castanea Vesca" },
  { remediesName: "Castor Equi" },
  { remediesName: "Castoreum" },
  { remediesName: "Caulophyllum Thalictroides" },
  { remediesName: "Causticum" },
  { remediesName: "Ceanothus Americanus" },
  { remediesName: "Cedron" },
  { remediesName: "Cenchris Contortrix" },
  { remediesName: "Cephalandra Indica" },
  { remediesName: "Cereus Bonplandii" },
  { remediesName: "Cerium Metallicum" },
  { remediesName: "Cerium Oxalicum" },
  { remediesName: "Chamomilla" },
  { remediesName: "Chaparo Amargoso" },
  { remediesName: "Chaparro Amargoso (Castela Texana)" },
  { remediesName: "Chaulmoograe" },
  { remediesName: "Cheiranthus Cheiri" },
  { remediesName: "Chelidonium Majus" },
  { remediesName: "Chelone Glabra" },
  { remediesName: "Chenopodium Anthelminticum" },
  { remediesName: "Chenopodium Vulvara" },
  { remediesName: "Cherianthus Cheri" },
  { remediesName: "Chimaphila Umbellata" },
  { remediesName: "Chininum Arsenicicum" },
  { remediesName: "Chininum Arsenicosum" },
  { remediesName: "Chininum Bromhydricum" },
  { remediesName: "Chininum Muriaticum" },
  { remediesName: "Chininum Purum" },
  { remediesName: "Chininum Sulphuricum" },
  { remediesName: "Chionanthus Virginica" },
  { remediesName: "Chlolarum" },
  { remediesName: "Chlorinum" },
  { remediesName: "Chloroformum" },
  { remediesName: "Chlorpromazine" },
  { remediesName: "Chocolate" },
  { remediesName: "Cholesterinum" },
  { remediesName: "Chrysanthemum Parth" },
  { remediesName: "Chrysarobinum" },
  { remediesName: "Cicaderma" },
  { remediesName: "Cicuta Maculata" },
  { remediesName: "Cicuta Virosa" },
  { remediesName: "Cimex Lectularius" },
  { remediesName: "Cimicifuga Racemosa" },
  { remediesName: "Cina" },
  { remediesName: "Cinchona Officinalis" },
  { remediesName: "Cinchoninum Sulphuricum" },
  { remediesName: "Cineraria Maritima" },
  { remediesName: "Cineraria Maritima ( Alochol Free)" },
];

async function insertRemedies() {
  try {
    await SuperRemedies.bulkCreate(remedies, {
      ignoreDuplicates: true, // prevent errors on unique constraint
    });
    console.log("✅ Remedies inserted successfully!");
  } catch (error) {
    console.error("❌ Error inserting remedies:", error);
  }
}
// Update Remedy
const updateRemedy = async (request, reply) => {
  try {
    const { id } = request.params;
    const { remediesName } = request.body;

    const remedy = await SuperRemedies.findByPk(id);
    if (!remedy) {
      return reply.code(404).send({ message: "Remedy not found" });
    }

    if (remediesName) {
      remedy.remediesName = remediesName.trim().toUpperCase();
    }

    await remedy.save();

    return reply.code(200).send({
      message: "Remedy updated successfully",
      data: remedy,
    });
  } catch (error) {
    return reply.code(500).send({ message: "Error updating remedy", error });
  }
};

// Delete Remedy
const deleteRemedy = async (request, reply) => {
  try {
    const { id } = request.params;

    const deleted = await SuperRemedies.destroy({ where: { id } });
    if (!deleted) {
      return reply.code(404).send({ message: "Remedy not found" });
    }

    return reply.code(200).send({ message: "Remedy deleted successfully" });
  } catch (error) {
    return reply.code(500).send({ message: "Error deleting remedy", error });
  }
};

// Get All Remedies
const getAllRemedies = async (request, reply) => {
  try {
    const remedies = await SuperRemedies.findAll({
      order: [["createdAt"]],
    });

    return reply.code(200).send({ data: remedies });
  } catch (error) {
    return reply.code(500).send({ message: "Error fetching remedies", error });
  }
};

module.exports = {
  addRemedy,
  updateRemedy,
  deleteRemedy,
  getAllRemedies,
  insertRemedies,
};
