module.exports = {
  folders: ['Controllers', 'Routes', 'Models', 'Middleware'],

  mfiles: (name, options) => {
    let files = [
      {
        folder: 'Models',
        name: `${name}.Model.js`,
        content: `
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const ${name}Schema = new Schema({
  // String field with required validation, minimum length, maximum length, and default value
  stringField: {
    type: String,
    required: [true, 'String field is required'],
    minlength: [5, 'String field must be at least 5 characters long'],
    maxlength: [50, 'String field must be less than 50 characters long'],
    default: 'Default String'
  },
  // Number field with required validation, minimum value, maximum value, and default value
  numberField: {
    type: Number,
    required: [true, 'Number field is required'],
    min: [0, 'Number field must be at least 0'],
    max: [100, 'Number field must be less than or equal to 100'],
    default: 42
  },
  // Date field with default value set to current date and time
  dateField: {
    type: Date,
    default: Date.now
  },
  // Buffer field for storing binary data
  bufferField: Buffer,
  // Boolean field with default value
  booleanField: {
    type: Boolean,
    default: false
  },
  // Mixed field that can hold any type of value
  mixedField: {
    type: Schema.Types.Mixed,
    default: {}
  },
  // ObjectId field for referencing another document
  objectIdField: {
    type: Schema.Types.ObjectId,
    ref: '${name}Model'
  },
  // Array field containing strings
  arrayField: {
    type: [String],
    default: ['defaultItem1', 'defaultItem2']
  },
  // Decimal128 field for high-precision decimal values
  decimal128Field: {
    type: Schema.Types.Decimal128,
    default: 0.0
  },
  // Map field for storing key-value pairs of strings
  mapField: {
    type: Map,
    of: String,
    default: new Map([['key1', 'value1'], ['key2', 'value2']])
  },
  // Nested object with fields containing default values
  nestedObject: {
    nestedString: {
      type: String,
      default: 'Nested Default String'
    },
    nestedNumber: {
      type: Number,
      default: 10
    }
  },
  // List of lists containing nested arrays of numbers
  listOfLists: {
    type: [[Number]],
    default: [[1, 2, 3], [4, 5, 6]]
  },
  // List of objects with subfields and default values
  listOfObjects: {
    type: [{
      subField1: {
        type: String,
        default: 'SubField Default'
      },
      subField2: {
        type: Number,
        default: 100
      }
    }],
    default: [{ subField1: 'Default1', subField2: 100 }, { subField1: 'Default2', subField2: 200 }]
  },
  // Email field with validation
  emailField: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\\S+@\\S+\\.\\S+/, 'Invalid email address']
  }
}, {
  timestamps: true,
  versionKey: false
});

${name}Schema.index({ emailField: 1 }, { unique: true });

${name}Schema.pre('save', function(next) {
  console.log('Saving document...');
  next();
});

const ${name}Model = mongoose.model('${name}', ${name}Schema);

module.exports = ${name}Model;`
      },

      {
        folder: 'Controllers',
        name: `${name}.Controller.js`,
        content: `
// Importing HTTP status codes and messages from utilities
const { Codes, Messages } = require("../Utils/httpCodesAndMessages");
// Importing the response handler utility for managing API responses
const ResponseHandler = require("../Utils/responseHandler");
const ${name}Model = require("../Models/${name}.Model");

module.exports = {
  create${name}: async (req, res, done) => {
    try {
      const result = await ${name}Model(req.body).save();
      ResponseHandler.sendSuccess(res, result, Codes.CREATED, Messages.DATA_CREATED_SUCCESS);
      return;
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  },

  get${name}: async (req, res, done) => {
    try {
      if (req.query.id) {
        const result = await ${name}Model.findById(req.query.id);
        if (!result) {
          ResponseHandler.sendError(res, "Data not found", Codes.NOT_FOUND, Messages.NOT_FOUND);
          return;
        }
        ResponseHandler.sendSuccess(res, result, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
        return;
      } else {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await ${name}Model.find().skip(skip).limit(limit);
        const totalItem = await ${name}Model.countDocuments();
        const totalPages = Math.ceil(totalItem / limit);
        const results = { result, totalPages };
        ResponseHandler.sendSuccess(res, results, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
        return;
      }
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  },

  update${name}: async (req, res, done) => {
    try {
      if (req.query.id) {
        const result = await ${name}Model.findByIdAndUpdate(req.query.id, req.body, { new: true });
        if (!result) {
          ResponseHandler.sendError(res, "Data not found", Codes.NOT_FOUND, Messages.NOT_FOUND);
          return;
        }
        ResponseHandler.sendSuccess(res, result, Codes.OK, Messages.DATA_UPDATED_SUCCESS);
        return;
      } else {
        ResponseHandler.sendError(res, "ID not provided", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
        return;
      }
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  },

  delete${name}: async (req, res, done) => {
    try {
      if (req.query.id) {
        const result = await ${name}Model.findByIdAndDelete(req.query.id);
        if (!result) {
          ResponseHandler.sendError(res, "Data not found", Codes.NOT_FOUND, Messages.NOT_FOUND);
          return;
        }
        ResponseHandler.sendSuccess(res, result, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
        return;
      } else {
        ResponseHandler.sendError(res, "ID not provided", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
        return;
      }
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  }
}`
      },

      {
        folder: 'Routes',
        name: `${name}.Route.js`,
        content: `
const ${name}Controller = require("../Controllers/${name}.Controller")
${options && options.compress ? `const { compressFile } = require("../Middleware/compressMiddleware");` : ''}

/**
 * Defines routes for the Fastify server related to ${name} operations.
 * @param {Fastify} fastify - The Fastify server instance.
 * @param {Object} options - Options for the route.
 */
async function routes(fastify, options) {
${options && options.compress
            ? `  await fastify.register(require('@fastify/multipart'));
  fastify.post("/", { preHandler: [compressFile] }, ${name}Controller.create${name});`
            : `  fastify.post("/", ${name}Controller.create${name});`}
  fastify.get("/", ${name}Controller.get${name});
  fastify.put("/", ${name}Controller.update${name});
  fastify.delete("/", ${name}Controller.delete${name});
}

module.exports = routes;`
      }
    ];

    if (options && options.compress) {
      files.push({
        folder: 'Middleware',
        name: 'compressMiddleware.js',
        content: getCompressMiddlewareContent()
      });
    }

    return files;
  },

  sfiles: (name, options) => {
    let files = [
      {
        folder: 'Models',
        name: `${name}.Model.js`,
        content: `
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const ${name}Model = sequelize.define('${name}Model', {
  // String field with required validation, minimum length, maximum length, and default value
  stringField: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'String field is required' },
      len: {
        args: [5, 50],
        msg: 'String field must be between 5 and 50 characters long'
      }
    },
    defaultValue: 'Default String'
  },
  // Number field with required validation, minimum value, maximum value, and default value
  numberField: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'Number field is required' },
      min: {
        args: [0],
        msg: 'Number field must be at least 0'
      },
      max: {
        args: [100],
        msg: 'Number field must be less than or equal to 100'
      }
    },
    defaultValue: 42
  },
  // Date field with default value set to current date and time
  dateField: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Buffer field for storing binary data
  bufferField: {
    type: DataTypes.BLOB
  },
  // Boolean field with default value
  booleanField: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Mixed field (JSON)
  mixedField: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  // UUID field
  objectIdField: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  // Array field containing strings
  arrayField: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: ['defaultItem1', 'defaultItem2']
  },
  // Decimal field for high-precision decimal values
  decimal128Field: {
    type: DataTypes.DECIMAL(38, 16),
    defaultValue: 0.0
  },
  // Map field (JSON)
  mapField: {
    type: DataTypes.JSON,
    defaultValue: { key1: 'value1', key2: 'value2' }
  },
  // Nested object (JSON)
  nestedObject: {
    type: DataTypes.JSON,
    defaultValue: { nestedString: 'Nested Default String', nestedNumber: 10 }
  },
  // List of lists (JSON)
  listOfLists: {
    type: DataTypes.JSON,
    defaultValue: [[1, 2, 3], [4, 5, 6]]
  },
  // List of objects (JSON)
  listOfObjects: {
    type: DataTypes.JSON,
    defaultValue: [
      { subField1: 'Default1', subField2: 100 },
      { subField1: 'Default2', subField2: 200 }
    ]
  },
  // Email field with validation
  emailField: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('emailField', value.trim().toLowerCase());
    },
    validate: {
      notNull: { msg: 'Email is required' },
      isEmail: { msg: 'Invalid email address' }
    }
  }
}, {
  tableName: '${name}_models',
  timestamps: true
});

module.exports = ${name}Model;`
      },

      {
        folder: 'Controllers',
        name: `${name}.Controller.js`,
        content: `
// Importing HTTP status codes and messages from utilities
const { Codes, Messages } = require("../Utils/httpCodesAndMessages");
// Importing the response handler utility for managing API responses
const ResponseHandler = require("../Utils/responseHandler");
const ${name}Model = require("../Models/${name}.Model");

module.exports = {
  create${name}: async (req, res, done) => {
    try {
      const result = await ${name}Model.create(req.body);
      ResponseHandler.sendSuccess(res, result, Codes.CREATED, Messages.DATA_CREATED_SUCCESS);
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  },

  get${name}: async (req, res, done) => {
    try {
      if (req.query.id) {
        const result = await ${name}Model.findByPk(req.query.id);
        if (!result) {
          ResponseHandler.sendError(res, "Data not found", Codes.NOT_FOUND, Messages.NOT_FOUND);
          return;
        }
        ResponseHandler.sendSuccess(res, result, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
      } else {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const offset = (page - 1) * limit;
        const result = await ${name}Model.findAll({ offset, limit });
        const totalItem = await ${name}Model.count();
        const totalPages = Math.ceil(totalItem / limit);
        const results = { result, totalPages };
        ResponseHandler.sendSuccess(res, results, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
      }
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  },

  update${name}: async (req, res, done) => {
    try {
      if (req.query.id) {
        const updated${name} = await ${name}Model.update(req.body, {
          where: { id: req.query.id },
          returning: true
        });
        if (!updated${name}[0]) {
          ResponseHandler.sendError(res, "Data not found", Codes.NOT_FOUND, Messages.NOT_FOUND);
          return;
        }
        ResponseHandler.sendSuccess(res, updated${name}[1][0], Codes.OK, Messages.DATA_UPDATED_SUCCESS);
      } else {
        ResponseHandler.sendError(res, "ID not provided", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
      }
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  },

  delete${name}: async (req, res, done) => {
    try {
      if (req.query.id) {
        const result = await ${name}Model.destroy({ where: { id: req.query.id } });
        if (!result) {
          ResponseHandler.sendError(res, "Data not found", Codes.NOT_FOUND, Messages.NOT_FOUND);
          return;
        }
        ResponseHandler.sendSuccess(res, result, Codes.OK, Messages.DATA_DELETED_SUCCESS);
      } else {
        ResponseHandler.sendError(res, "ID not provided", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
      }
    } catch (error) {
      ResponseHandler.sendError(res, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
      return;
    }
  }
}`
      },

      {
        folder: 'Routes',
        name: `${name}.Route.js`,
        content: `
const ${name}Controller = require("../Controllers/${name}.Controller")
${options && options.compress ? `const { compressFile } = require("../Middleware/compressMiddleware");` : ''}

/**
 * Defines routes for the Fastify server related to ${name} operations.
 * @param {Fastify} fastify - The Fastify server instance.
 * @param {Object} options - Options for the route.
 */
async function routes(fastify, options) {
${options && options.compress
            ? `  await fastify.register(require('@fastify/multipart'));
  fastify.post("/", { preHandler: [compressFile] }, ${name}Controller.create${name});`
            : `  fastify.post("/", ${name}Controller.create${name});`}
  fastify.get("/", ${name}Controller.get${name});
  fastify.put("/", ${name}Controller.update${name});
  fastify.delete("/", ${name}Controller.delete${name});
}

module.exports = routes;`
      }
    ];

    if (options && options.compress) {
      files.push({
        folder: 'Middleware',
        name: 'compressMiddleware.js',
        content: getCompressMiddlewareContent()
      });
    }

    return files;
  }
};

/**
 * Returns the content string for compressMiddleware.js.
 * Extracted as a shared helper to avoid duplication between mfiles and sfiles,
 * and to avoid nested template-literal escaping issues.
 */
function getCompressMiddlewareContent() {
  return [
    "const util = require('util');",
    "const path = require('path');",
    "const fs = require('fs');",
    "const { pipeline } = require('stream');",
    "const pump = util.promisify(pipeline);",
    "const sharp = require('sharp');",
    "const archiver = require('archiver');",
    "const ffmpeg = require('fluent-ffmpeg');",
    "",
    "const IMAGE_SIZE_THRESHOLD = 5 * 1024 * 1024;   // 5MB",
    "const VIDEO_SIZE_THRESHOLD = 100 * 1024 * 1024; // 100MB",
    "",
    "const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'tiff'];",
    "const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];",
    "",
    "async function compressImage(filePath, ext) {",
    "    const compressedPath = filePath.replace('.' + ext, '-compressed.' + ext);",
    "    const outputFormat = ext === 'jpg' ? 'jpeg' : ext;",
    "",
    "    await sharp(filePath)",
    "    [outputFormat]({ quality: 80, effort: 6 })",
    "        .toFile(compressedPath);",
    "",
    "    const originalSize = fs.statSync(filePath).size;",
    "    const compressedSize = fs.statSync(compressedPath).size;",
    "",
    "    if (compressedSize < originalSize) {",
    "        fs.unlinkSync(filePath);",
    "        fs.renameSync(compressedPath, filePath);",
    "        console.log(`Image compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);",
    "    } else {",
    "        fs.unlinkSync(compressedPath);",
    "        console.log('Compression did not reduce size, keeping original.');",
    "    }",
    "}",
    "",
    "async function compressVideo(filePath, options = {}) {",
    "    const { crf = 28, preset = 'fast', resolution = null } = options;",
    "    const ext = path.extname(filePath);",
    "    const compressedPath = filePath.replace(ext, '-compressed.mp4');",
    "",
    "    await new Promise((resolve, reject) => {",
    "        let command = ffmpeg(filePath)",
    "            .videoCodec('libx264')",
    "            .audioCodec('aac')",
    "            .outputOptions([",
    "                '-crf ' + crf,",
    "                '-preset ' + preset,",
    "                '-movflags +faststart',",
    "            ])",
    "            .format('mp4');",
    "",
    "        if (resolution) {",
    "            command = command.size(resolution);",
    "        }",
    "",
    "        command",
    "            .on('end', resolve)",
    "            .on('error', reject)",
    "            .save(compressedPath);",
    "    });",
    "",
    "    const originalSize = fs.statSync(filePath).size;",
    "    const compressedSize = fs.statSync(compressedPath).size;",
    "",
    "    if (compressedSize < originalSize) {",
    "        fs.unlinkSync(filePath);",
    "        fs.renameSync(compressedPath, filePath.replace(ext, '.mp4'));",
    "        console.log(`Video compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);",
    "    } else {",
    "        fs.unlinkSync(compressedPath);",
    "        console.log('Video compression did not reduce size, keeping original.');",
    "    }",
    "}",
    "",
    "async function compressFileZip(filePath) {",
    "    const zipPath = filePath + '.zip';",
    "    const output = fs.createWriteStream(zipPath);",
    "    const archive = archiver('zip', { zlib: { level: 9 } });",
    "",
    "    return new Promise((resolve, reject) => {",
    "        output.on('close', () => {",
    "            const originalSize = fs.statSync(filePath).size;",
    "            const compressedSize = fs.statSync(zipPath).size;",
    "",
    "            if (compressedSize < originalSize) {",
    "                fs.unlinkSync(filePath);",
    "                console.log(`File compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);",
    "            } else {",
    "                fs.unlinkSync(zipPath);",
    "                console.log('Compression did not reduce size, keeping original.');",
    "            }",
    "            resolve();",
    "        });",
    "        archive.on('error', reject);",
    "        archive.pipe(output);",
    "        archive.file(filePath, { name: path.basename(filePath) });",
    "        archive.finalize();",
    "    });",
    "}",
    "",
    "async function compressFile(req, reply) {",
    "    if (!req.isMultipart || !req.isMultipart()) {",
    "        return;",
    "    }",
    "",
    "    const uploadsDir = path.join(process.cwd(), 'uploads');",
    "    if (!fs.existsSync(uploadsDir)) {",
    "        fs.mkdirSync(uploadsDir, { recursive: true });",
    "    }",
    "",
    "    req.body = req.body || {};",
    "    req.savedFiles = [];",
    "",
    "    try {",
    "        const parts = req.parts();",
    "        for await (const part of parts) {",
    "            if (part.type === 'file') {",
    "                const ext = path.extname(part.filename).replace('.', '').toLowerCase();",
    "                const filePath = path.join(uploadsDir, Date.now() + '-' + part.filename);",
    "",
    "                await pump(part.file, fs.createWriteStream(filePath));",
    "",
    "                const isVideo = VIDEO_EXTENSIONS.includes(ext);",
    "                const threshold = isVideo ? VIDEO_SIZE_THRESHOLD : IMAGE_SIZE_THRESHOLD;",
    "                const fileSize = fs.statSync(filePath).size;",
    "",
    "                if (fileSize > threshold) {",
    "                    if (IMAGE_EXTENSIONS.includes(ext)) {",
    "                        await compressImage(filePath, ext);",
    "                    } else if (isVideo) {",
    "                        await compressVideo(filePath, req.videoCompressOptions || {});",
    "                    } else {",
    "                        await compressFileZip(filePath);",
    "                    }",
    "                }",
    "",
    "                req.savedFiles.push({",
    "                    fieldname: part.fieldname,",
    "                    filename: part.filename,",
    "                    path: filePath",
    "                });",
    "            } else {",
    "                req.body[part.fieldname] = part.value;",
    "            }",
    "        }",
    "    } catch (err) {",
    "        console.error('Multipart parsing/compression error:', err);",
    "        if (req.savedFiles) {",
    "            for (const file of req.savedFiles) {",
    "                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);",
    "            }",
    "        }",
    "    }",
    "}",
    "",
    "module.exports = { compressFile };"
  ].join('\n');
}