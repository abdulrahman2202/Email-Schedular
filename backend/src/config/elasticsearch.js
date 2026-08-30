"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const client = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    headers: {
        accept: "application/json",
        "content-type": "application/json",
    },
    metaHeader: false,
});
exports.client = client;
//# sourceMappingURL=elasticsearch.js.map