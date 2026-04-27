module.exports = {
  folders: ['Controllers', 'Routes', 'Models', 'Middleware'],
  mfiles: (name, options) => {
    let files = [{
      folder: 'Models', name: `${name}.Model.ts`, content:
        `
import mongoose, { Schema } from 'mongoose';

// Define the schema
const ${name}sSchema = new Schema({
  // String field with required validation, minimum length, maximum length, and default value
  stringField: {
    type: String,
    required: [true, 'String field is required'], // Field is required
    minlength: [5, 'String field must be at least 5 characters long'], // Minimum length constraint
    maxlength: [50, 'String field must be less than 50 characters long'], // Maximum length constraint
    default: 'Default String' // Default value if not provided
  },
  // Number field with required validation, minimum value, maximum value, and default value
  numberField: {
    type: Number,
    required: [true, 'Number field is required'], // Field is required
    min: [0, 'Number field must be at least 0'], // Minimum value constraint
    max: [100, 'Number field must be less than or equal to 100'], // Maximum value constraint
    default: 42 // Default value if not provided
  },
  // Date field with default value set to current date and time
  dateField: {
    type: Date,
    default: Date.now // Default value set to current date and time
  },
  // Buffer field for storing binary data (no specific validation or default value provided here)
  bufferField: Buffer,
  // Boolean field with default value
  booleanField: {
    type: Boolean,
    default: false // Default value if not provided
  },
  // Mixed field that can hold any type of value, with an empty object as default
  mixedField: {
    type: Schema.Types.Mixed,
    default: {} // Default value is an empty object
  },
  // ObjectId field for referencing another document (self-referencing for ${name}s)
  objectIdField: {
    type: Schema.Types.ObjectId,
    ref: '${name}sModel' // Reference to self (${name}s purposes only)
  },
  // Array field containing strings, with default values
  arrayField: {
    type: [String],
    default: ['defaultItem1', 'defaultItem2'] // Default array with two items
  },
  // Decimal128 field for high-precision decimal values
  decimal128Field: {
    type: Schema.Types.Decimal128,
    default: 0.0 // Default value is 0.0
  },
  // Map field for storing key-value pairs of strings
  mapField: {
    type: Map,
    of: String,
    default: new Map([['key1', 'value1'], ['key2', 'value2']]) // Default map with key-value pairs
  },
  // Nested object with fields containing default values
  nestedObject: {
    nestedString: {
      type: String,
      default: 'Nested Default String' // Default value for nestedString
    },
    nestedNumber: {
      type: Number,
      default: 10 // Default value for nestedNumber
    }
  },
  // List of lists containing nested arrays of numbers with default values
  listOfLists: {
    type: [[Number]],
    default: [[1, 2, 3], [4, 5, 6]] // Default list of lists with nested numbers
  },
  // List of objects with subfields and default values
  listOfObjects: {
    type: [{
      subField1: {
        type: String,
        default: 'SubField Default' // Default value for subField1
      },
      subField2: {
        type: Number,
        default: 100 // Default value for subField2
      }
    }],
    default: [{ subField1: 'Default1', subField2: 100 }, { subField1: 'Default2', subField2: 200 }] // Default array of objects
  },
  // Email field with validation for format, uniqueness, and trimming
  emailField: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,  // Ensures uniqueness
  }
}, {
  timestamps: true, // Add createdAt and updatedAt timestamps
  versionKey: false // Disable versioning
});


// Middleware ${name}s (pre-save hook for validation)
${name}sSchema.pre('save', function (next) {
  // Add custom logic before saving
  console.log('Saving document...');
  next();
});

export default mongoose.model("${name}", ${name}sSchema)
`
    },

    {
      folder: 'Controllers',
      name: `${name}.Controller.ts`,
      content:
        `
/**
 * @file ${name}Controller.js
 * @module ${name}Controller
 * @description Handles CRUD operations for the ${name} resource.
 */
import { Context } from "elysia"; // Import Context from Elysia
import { Codes, Messages } from "../Utils/httpCodesAndMessages"; // Adjust path as needed
import ResponseHandler from "../Utils/responseHandler"; // Adjust path as needed
import ${name}Model from "../Models/${name}.Model"; // Adjust path as needed and rename to camelCase

interface CustomContext extends Context {
  body: any;
  params: { id?: string };
  query: { id?: string; page?: string; limit?: string; };
  set: any;
  headers: any;
  jwt: any;
}

/**
 * @function create${name}s
 * @description Creates a new ${name} document in the database.
 * @param {object} context - The request context.
 * @param {object} context.body - The request body containing ${name} data.
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response indicating success or failure.
 */
export const create${name}s = async ({ body, set }: CustomContext) => {
  try {
    if (!body.emailField) {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "Email is required.", Codes.BAD_REQUEST, Messages.VALIDATION_ERROR);
    }

    const existing${name} = await ${name}Model.findOne({ emailField: body.emailField });

    if (existing${name}) {
      set.status = Codes.CONFLICT;
      return ResponseHandler.sendError(set, "Email already exists.", Codes.CONFLICT, Messages.EMAIL_ALREADY_EXISTS);
    }

    const new${name} = new ${name}Model(body);
    const result = await new${name}.save();
    return ResponseHandler.sendSuccess(set, result, Codes.CREATED, Messages.DATA_CREATED_SUCCESS);
  } catch (error: any) {
    console.error("Error creating ${name}:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @function get${name}s
 * @description Retrieves a single ${name} by ID or paginated list of ${name}s.
 * @param {object} context - The request context.
 * @param {object} context.query - Query parameters (e.g., id, page).
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response with the requested ${name} data.
 */
export const get${name}s = async ({ query, set}: CustomContext) => {
  try {
    if (query.id) {
      const result = await ${name}Model.findById(query.id);
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, Error, Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
    } else {
      const page = Number(query.page) || 1;
      let limit = parseInt(query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const result = await ${name}Model.find().skip(skip).limit(limit);
      const totalItem = await ${name}Model.countDocuments();
      const totalPages = Math.ceil(totalItem / limit);
      const results = { result, totalPages };
      return ResponseHandler.sendSuccess(set, results, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
    }
  } catch (error) {
    console.error("Error getting ${name}s:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @function update${name}s
 * @description Updates an existing ${name} by ID.
 * @param {object} context - The request context.
 * @param {object} context.query - Query parameters (e.g., id).
 * @param {object} context.body - The request body containing updated ${name} data.
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response indicating success or failure.
 */
export const update${name}s = async ({ query, body, set }: CustomContext) => {
  try {
    if (query.id) {
      const result = await ${name}Model.findByIdAndUpdate(query.id, body, { new: true });
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, "no ${name} Found", Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_UPDATED_SUCCESS);
    } else {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "Bad Request", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
    }
  } catch (error) {
    console.error("Error updating ${name}:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error , Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @function delete${name}s
 * @description Deletes a ${name} by ID.
 * @param {object} context - The request context.
 * @param {object} context.query - Query parameters (e.g., id).
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response indicating success or failure.
 */
export const delete${name}s = async ({ query, set }: CustomContext) => {
  try {
    if (query.id) {
      const result = await ${name}Model.findByIdAndDelete(query.id);
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, "No ${name} found to delete", Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_DELETED_SUCCESS);
    } else {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "cant delete ${name}", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
    }
  } catch (error) {
    console.error("Error deleting ${name}:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};
              ` },


    {
      folder: 'Routes',
      name: `${name}.Route.ts`,
      content:
        `
import { Elysia } from "elysia";

// Importing the Controllers 
import { create${name}s, delete${name}s, get${name}s, update${name}s } from "../Controllers/${name}.controller"; // Import ${name} controller functions
${options && options.compress ? `import { compressFile } from "../Middleware/compressMiddleware";` : ''}

/**
 * Defines ${name} routes for the application.
 *
 * @param {Elysia} app - The Elysia application instance.
 * @returns {Elysia} - The modified application instance with ${name} routes.
 */
export const ${name}Routes = (app: Elysia): Elysia => {
  return app
    /**
     * Route for creating a new ${name}.
     *
     * @route POST /create
     * @handler create${name}s - Handles the creation of a ${name}.
     */
${options && options.compress ? `    .post("/", create${name}s, { beforeHandle: [compressFile] })` : `    .post("/", create${name}s)`}

    //for upload file
    //.post("/", create${name}s)

    /**
     * Route for retrieving ${name}s.
     *
     * @route GET /
     * @handler get${name}s - Handles the retrieval of ${name}s.
     */
    .get("/",get${name}s)

    /**
     * Route for updating a ${name}.
     *
     * @route PUT /
     * @handler update${name}s - Handles the update of a ${name}.
     * @queryParam id - The ID of the ${name} to update.
     */
    .put("/", update${name}s)

    /**
     * Route for deleting a ${name}.
     *
     * @route DELETE /:id
     * @handler delete${name}s - Handles the deletion of a ${name}.
     * @param id - The ID of the ${name} to delete (as a path parameter).
     */
    .delete("/", delete${name}s);

};           
              ` },
    ];

    if (options && options.compress) {
        files.push({
            folder: 'Middleware',
            name: 'compressMiddleware.ts',
            content: `import sharp from 'sharp';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const IMAGE_SIZE_THRESHOLD = 5 * 1024 * 1024;   // 5MB
const VIDEO_SIZE_THRESHOLD = 100 * 1024 * 1024; // 100MB

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'tiff'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];

async function compressImage(filePath: string, ext: string) {
    const compressedPath = filePath.replace('.' + ext, '-compressed.' + ext);
    const outputFormat = ext === 'jpg' ? 'jpeg' : ext;

    await (sharp(filePath) as any)
    // @ts-ignore
    [outputFormat]({ quality: 80, effort: 6 })
        .toFile(compressedPath);

    const originalSize = fs.statSync(filePath).size;
    const compressedSize = fs.statSync(compressedPath).size;

    if (compressedSize < originalSize) {
        fs.unlinkSync(filePath);
        fs.renameSync(compressedPath, filePath);
        console.log(\`Image compressed: \${(originalSize / 1024 / 1024).toFixed(2)}MB → \${(compressedSize / 1024 / 1024).toFixed(2)}MB\`);
    } else {
        fs.unlinkSync(compressedPath);
        console.log('Compression did not reduce size, keeping original.');
    }
}

async function compressVideo(filePath: string, options: any = {}) {
    const { crf = 28, preset = 'fast', resolution = null } = options;
    const ext = path.extname(filePath);
    const compressedPath = filePath.replace(ext, '-compressed.mp4');

    await new Promise((resolve, reject) => {
        let command = ffmpeg(filePath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-crf ' + crf,
                '-preset ' + preset,
                '-movflags +faststart',
            ])
            .format('mp4');

        if (resolution) {
            command = command.size(resolution);
        }

        command
            .on('end', resolve)
            .on('error', reject)
            .save(compressedPath);
    });

    const originalSize = fs.statSync(filePath).size;
    const compressedSize = fs.statSync(compressedPath).size;

    if (compressedSize < originalSize) {
        fs.unlinkSync(filePath);
        fs.renameSync(compressedPath, filePath.replace(ext, '.mp4'));
        console.log(\`Video compressed: \${(originalSize / 1024 / 1024).toFixed(2)}MB → \${(compressedSize / 1024 / 1024).toFixed(2)}MB\`);
    } else {
        fs.unlinkSync(compressedPath);
        console.log('Video compression did not reduce size, keeping original.');
    }
}

async function compressFileZip(filePath: string) {
    const zipPath = filePath + '.zip';
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise<void>((resolve, reject) => {
        output.on('close', () => {
            const originalSize = fs.statSync(filePath).size;
            const compressedSize = fs.statSync(zipPath).size;

            if (compressedSize < originalSize) {
                fs.unlinkSync(filePath);
                console.log(\`File compressed: \${(originalSize / 1024 / 1024).toFixed(2)}MB → \${(compressedSize / 1024 / 1024).toFixed(2)}MB\`);
            } else {
                fs.unlinkSync(zipPath);
                console.log('Compression did not reduce size, keeping original.');
            }
            resolve();
        });
        archive.on('error', reject);
        archive.pipe(output);
        archive.file(filePath, { name: path.basename(filePath) });
        archive.finalize();
    });
}

export const compressFile = async ({ body }: any) => {
    const processingFiles: string[] = [];
    try {
        if (!body || !body.file) return;

        const files = Array.isArray(body.file) ? body.file : [body.file];

        await Promise.all(
            files.map(async (file: any) => {
                if (!file || !file.name) return;
                const ext = path.extname(file.name).replace('.', '').toLowerCase();
                const isVideo = VIDEO_EXTENSIONS.includes(ext);
                const threshold = isVideo ? VIDEO_SIZE_THRESHOLD : IMAGE_SIZE_THRESHOLD;

                if (file.size <= threshold) return;

                const uploadsDir = path.join(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const filePath = path.join(uploadsDir, Date.now() + '-' + file.name);
                processingFiles.push(filePath);
                
                const buffer = Buffer.from(await file.arrayBuffer());
                fs.writeFileSync(filePath, buffer);

                if (IMAGE_EXTENSIONS.includes(ext)) {
                    await compressImage(filePath, ext);
                } else if (isVideo) {
                    await compressVideo(filePath, body.videoCompressOptions || {});
                } else {
                    await compressFileZip(filePath);
                }
                
                file.savedPath = filePath;
            })
        );
    } catch (err) {
        console.error('Compression error:', err);
        for (const filePath of processingFiles) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
};
`
        });
    }
    return files;
  },
  sfiles: (name, options) => {
    let files = [{
      folder: 'Models', name: `${name}.Model.ts`, content: `

      import { DataTypes, Model, Optional } from "sequelize";
      import { sequelize } from "../config/dbConfig"; // Ensure correct path
      
      // ✅ Define TypeScript Interface for Model Attributes
      interface ${name}Attributes {
        id?: string;
        stringField: string;
        numberField: number;
        dateField?: Date;
        bufferField?: Buffer | null;
        booleanField: boolean;
        mixedField: any;
        objectIdField?: string;
        arrayField: string[];
        decimal128Field: number;
        mapField: Record<string, string>;
        nestedObject: {
          nestedString: string;
          nestedNumber: number;
        };
        listOfLists: number[][];
        listOfObjects: {
          subField1: string;
          subField2: number;
        }[];
        emailField: string;
        createdAt?: Date;
        updatedAt?: Date;
      }
      
      // ✅ Define TypeScript Interface for Creation (Excluding 'id')
      interface ${name}CreationAttributes extends Optional<${name}Attributes, "id"> {}
      
      // ✅ Define ${name}Model Class Extending Sequelize Model
      class ${name}Model extends Model<${name}Attributes, ${name}CreationAttributes> implements ${name}Attributes {
        public id!: string;
        public stringField!: string;
        public numberField!: number;
        public dateField!: Date;
        public bufferField!: Buffer | null;
        public booleanField!: boolean;
        public mixedField!: any;
        public objectIdField!: string;
        public arrayField!: string[];
        public decimal128Field!: number;
        public mapField!: Record<string, string>;
        public nestedObject!: {
          nestedString: string;
          nestedNumber: number;
        };
        public listOfLists!: number[][];
        public listOfObjects!: {
          subField1: string;
          subField2: number;
        }[];
        public emailField!: string;
        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
      }
      
      // ✅ Initialize the ${name}Model
      ${name}Model.init(
        {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
          },
          stringField: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notNull: { msg: "String field is required" },
              len: {
                args: [5, 50],
                msg: "String field must be between 5 and 50 characters long",
              },
            },
            defaultValue: "Default String",
          },
          numberField: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
              notNull: { msg: "Number field is required" },
              min: {
                args: [0],
                msg: "Number field must be at least 0",
              },
              max: {
                args: [100],
                msg: "Number field must be less than or equal to 100",
              },
            },
            defaultValue: 42,
          },
          dateField: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
          },
          bufferField: {
            type: DataTypes.BLOB("long"),
            allowNull: true,
          },
          booleanField: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
          },
          mixedField: {
            type: DataTypes.JSON,
            defaultValue: {},
          },
          objectIdField: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
          },
          arrayField: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: ["defaultItem1", "defaultItem2"],
          },
          decimal128Field: {
            type: DataTypes.DECIMAL(38, 16),
            defaultValue: 0.0,
          },
          mapField: {
            type: DataTypes.JSON,
            defaultValue: { key1: "value1", key2: "value2" },
          },
          nestedObject: {
            type: DataTypes.JSON,
            defaultValue: { nestedString: "Nested Default String", nestedNumber: 10 },
          },
          listOfLists: {
            type: DataTypes.JSON,
            defaultValue: [
              [1, 2, 3],
              [4, 5, 6],
            ],
          },
          listOfObjects: {
            type: DataTypes.JSON,
            defaultValue: [
              { subField1: "Default1", subField2: 100 },
              { subField1: "Default2", subField2: 200 },
            ],
          },
          emailField: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(value: string) {
              this.setDataValue("emailField", value.trim().toLowerCase());
            },
            validate: {
              notNull: { msg: "Email is required" },
              isEmail: { msg: "Invalid email address" },
            },
          },
        },
        {
          sequelize,
          tableName: "${name}s",
          timestamps: true, // ✅ Enables createdAt & updatedAt fields
        }
      );
      
      // ✅ Export the ${name}Model for usage in other files
      export default ${name}Model;
      
      `},
    {
      folder: 'Controllers',
      name: `${name}.Controller.ts`,
      content: `

/**
 * @file ${name}Controller.js
 * @module ${name}Controller
 * @description Handles CRUD operations for the ${name} resource.
 */
import { Context } from "elysia"; // Import Context from Elysia
import { Codes, Messages } from "../Utils/httpCodesAndMessages"; // Adjust path as needed
import ResponseHandler from "../Utils/responseHandler"; // Adjust path as needed
import ${name}Model from "../Models/${name}.Model"; // Adjust path as needed and rename to camelCase

interface CustomContext extends Context {
  body: any;
  params: { id?: string };
  query: { id?: string; page?: string; limit?: string; };
  set: any;
  headers: any;
  jwt: any;
}

/**
 * @function create${name}s
 * @description Creates a new ${name} document in the database.
 * @param {object} context - The request context.
 * @param {object} context.body - The request body containing ${name} data.
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response indicating success or failure.
 */
export const create${name}s = async ({ body, set }: CustomContext) => {
  try {
    if (!body.emailField) {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "Email is required.", Codes.BAD_REQUEST, Messages.VALIDATION_ERROR);
    }

    const existing${name} = await ${name}Model.findOne({ where: { emailField: body.emailField } });

    if (existing${name}) {
      set.status = Codes.CONFLICT;
      return ResponseHandler.sendError(set, "Email already exists.", Codes.CONFLICT, Messages.EMAIL_ALREADY_EXISTS);
    }

    // const new${name} = new ${name}Model(body);
    // const result = await new${name}.save();
    // const result = await ${name}Model.create(req.body);
    const result = await ${name}Model.create(body);

    return ResponseHandler.sendSuccess(set, result, Codes.CREATED, Messages.DATA_CREATED_SUCCESS);
  } catch (error: any) {
    console.error("Error creating ${name}:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @function get${name}s
 * @description Retrieves a single ${name} by ID or paginated list of ${name}s.
 * @param {object} context - The request context.
 * @param {object} context.query - Query parameters (e.g., id, page).
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response with the requested ${name} data.
 */
export const get${name}s = async ({ query, set}: CustomContext) => {
  try {
    if (query.id) {
      const result = await ${name}Model.findByPk(query.id);
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, Error, Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
    } else {
      const page = Number(query.page) || 1;
      let limit = parseInt(query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const result = await ${name}Model.findAll({ offset, limit });
      const totalItem = await ${name}Model.count();
      const totalPages = Math.ceil(totalItem / limit);
      const results = { result, totalPages };
      return ResponseHandler.sendSuccess(set, results, Codes.OK, Messages.DATA_RETRIEVED_SUCCESS);
    }
  } catch (error) {
    console.error("Error getting ${name}s:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @function update${name}s
 * @description Updates an existing ${name} by ID.
 * @param {object} context - The request context.
 * @param {object} context.query - Query parameters (e.g., id).
 * @param {object} context.body - The request body containing updated ${name} data.
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response indicating success or failure.
 */
export const update${name}s = async ({ query, body, set }: CustomContext) => {
  try {
    if (query.id) {
      const update${name}s = await ${name}Model.update(body, {
        where: { id: query.id },
        returning: true
      });
      if (!update${name}s[0]) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, "no ${name} Found", Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, update${name}s[1][0], Codes.OK, Messages.DATA_UPDATED_SUCCESS);
    } else {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "Bad Request", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
    }
  } catch (error) {
    console.error("Error updating ${name}:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error , Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @function delete${name}s
 * @description Deletes a ${name} by ID.
 * @param {object} context - The request context.
 * @param {object} context.query - Query parameters (e.g., id).
 * @param {object} context.set - Response object for setting HTTP status codes.
 * @returns {object} JSON response indicating success or failure.
 */
export const delete${name}s = async ({ query, set }: CustomContext) => {
  try {
    if (query.id) {
      const result = await ${name}Model.destroy({ where: { id: query.id } });
      if (!result) {
        set.status = Codes.NOT_FOUND;
        return ResponseHandler.sendError(set, "No ${name} found to delete", Codes.NOT_FOUND, Messages.NOT_FOUND);
      }
      return ResponseHandler.sendSuccess(set, result, Codes.OK, Messages.DATA_DELETED_SUCCESS);
    } else {
      set.status = Codes.BAD_REQUEST;
      return ResponseHandler.sendError(set, "cant delete ${name}", Codes.BAD_REQUEST, Messages.BAD_REQUEST);
    }
  } catch (error) {
    console.error("Error deleting ${name}:", error);
    set.status = Codes.INTERNAL_SERVER_ERROR;
    return ResponseHandler.sendError(set, error, Codes.INTERNAL_SERVER_ERROR, Messages.INTERNAL_SERVER_ERROR);
  }
};    
      `
    },
    {
      folder: 'Routes',
      name: `${name}.Route.ts`,
      content:
        `
import { Elysia } from "elysia";

// Importing the Controllers 
import { create${name}s, delete${name}s, get${name}s, update${name}s } from "../Controllers/${name}.Controller"; // Import ${name} controller functions
import upload from "../Middleware/fileUpload";
${options && options.compress ? `import { compressFile } from "../Middleware/compressMiddleware";` : ''}

/**
 * Defines ${name} routes for the application.
 *
 * @param {Elysia} app - The Elysia application instance.
 * @returns {Elysia} - The modified application instance with ${name} routes.
 */
export const ${name}Routes = (app: Elysia): Elysia => {
  return app
    /**
     * Route for creating a new ${name}.
     *
     * @route POST /create
     * @handler create${name}s - Handles the creation of a ${name}.
     */
${options && options.compress ? `    .post("/", create${name}s, { beforeHandle: [upload, compressFile] })` : `    .post("/", create${name}s, { beforeHandle: upload })`}

    /**
     * Route for retrieving ${name}s.
     *
     * @route GET /
     * @handler get${name}s - Handles the retrieval of ${name}s.
     */
    .get("/",get${name}s)

    /**
     * Route for updating a ${name}.
     *
     * @route PUT /
     * @handler update${name}s - Handles the update of a ${name}.
     * @queryParam id - The ID of the ${name} to update.
     */
    .put("/", update${name}s)

    /**
     * Route for deleting a ${name}.
     *
     * @route DELETE /:id
     * @handler delete${name}s - Handles the deletion of a ${name}.
     * @param id - The ID of the ${name} to delete (as a path parameter).
     */
    .delete("/", delete${name}s);

};    
          ` }
    ];

    if (options && options.compress) {
        files.push({
            folder: 'Middleware',
            name: 'compressMiddleware.ts',
            content: `import sharp from 'sharp';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const IMAGE_SIZE_THRESHOLD = 5 * 1024 * 1024;   // 5MB
const VIDEO_SIZE_THRESHOLD = 100 * 1024 * 1024; // 100MB

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'tiff'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];

async function compressImage(filePath: string, ext: string) {
    const compressedPath = filePath.replace('.' + ext, '-compressed.' + ext);
    const outputFormat = ext === 'jpg' ? 'jpeg' : ext;

    await (sharp(filePath) as any)
    // @ts-ignore
    [outputFormat]({ quality: 80, effort: 6 })
        .toFile(compressedPath);

    const originalSize = fs.statSync(filePath).size;
    const compressedSize = fs.statSync(compressedPath).size;

    if (compressedSize < originalSize) {
        fs.unlinkSync(filePath);
        fs.renameSync(compressedPath, filePath);
        console.log(\`Image compressed: \${(originalSize / 1024 / 1024).toFixed(2)}MB → \${(compressedSize / 1024 / 1024).toFixed(2)}MB\`);
    } else {
        fs.unlinkSync(compressedPath);
        console.log('Compression did not reduce size, keeping original.');
    }
}

async function compressVideo(filePath: string, options: any = {}) {
    const { crf = 28, preset = 'fast', resolution = null } = options;
    const ext = path.extname(filePath);
    const compressedPath = filePath.replace(ext, '-compressed.mp4');

    await new Promise((resolve, reject) => {
        let command = ffmpeg(filePath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-crf ' + crf,
                '-preset ' + preset,
                '-movflags +faststart',
            ])
            .format('mp4');

        if (resolution) {
            command = command.size(resolution);
        }

        command
            .on('end', resolve)
            .on('error', reject)
            .save(compressedPath);
    });

    const originalSize = fs.statSync(filePath).size;
    const compressedSize = fs.statSync(compressedPath).size;

    if (compressedSize < originalSize) {
        fs.unlinkSync(filePath);
        fs.renameSync(compressedPath, filePath.replace(ext, '.mp4'));
        console.log(\`Video compressed: \${(originalSize / 1024 / 1024).toFixed(2)}MB → \${(compressedSize / 1024 / 1024).toFixed(2)}MB\`);
    } else {
        fs.unlinkSync(compressedPath);
        console.log('Video compression did not reduce size, keeping original.');
    }
}

async function compressFileZip(filePath: string) {
    const zipPath = filePath + '.zip';
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise<void>((resolve, reject) => {
        output.on('close', () => {
            const originalSize = fs.statSync(filePath).size;
            const compressedSize = fs.statSync(zipPath).size;

            if (compressedSize < originalSize) {
                fs.unlinkSync(filePath);
                console.log(\`File compressed: \${(originalSize / 1024 / 1024).toFixed(2)}MB → \${(compressedSize / 1024 / 1024).toFixed(2)}MB\`);
            } else {
                fs.unlinkSync(zipPath);
                console.log('Compression did not reduce size, keeping original.');
            }
            resolve();
        });
        archive.on('error', reject);
        archive.pipe(output);
        archive.file(filePath, { name: path.basename(filePath) });
        archive.finalize();
    });
}

export const compressFile = async ({ body }: any) => {
    const processingFiles: string[] = [];
    try {
        if (!body || !body.file) return;

        const files = Array.isArray(body.file) ? body.file : [body.file];

        await Promise.all(
            files.map(async (file: any) => {
                if (!file || !file.name) return;
                const ext = path.extname(file.name).replace('.', '').toLowerCase();
                const isVideo = VIDEO_EXTENSIONS.includes(ext);
                const threshold = isVideo ? VIDEO_SIZE_THRESHOLD : IMAGE_SIZE_THRESHOLD;

                if (file.size <= threshold) return;

                const uploadsDir = path.join(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const filePath = path.join(uploadsDir, Date.now() + '-' + file.name);
                processingFiles.push(filePath);
                
                const buffer = Buffer.from(await file.arrayBuffer());
                fs.writeFileSync(filePath, buffer);

                if (IMAGE_EXTENSIONS.includes(ext)) {
                    await compressImage(filePath, ext);
                } else if (isVideo) {
                    await compressVideo(filePath, body.videoCompressOptions || {});
                } else {
                    await compressFileZip(filePath);
                }
                
                file.savedPath = filePath;
            })
        );
    } catch (err) {
        console.error('Compression error:', err);
        for (const filePath of processingFiles) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
    }
};
`
        });
    }
    return files;
  }