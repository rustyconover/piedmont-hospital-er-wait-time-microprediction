// What this code does is download the latest load information and publishes to microprediction.org
import { MicroWriter, MicroWriterConfig } from "microprediction";
import { stream_write_keys } from "./write-keys";
const bent = require("bent");

import * as _ from "lodash";
const getJSON = bent("json");
const get = bent("GET");
import { ScheduledHandler } from "aws-lambda";
import moment from "moment-timezone";
import cheerio from "cheerio";
import * as fs from "fs";

async function getStats(): Promise<[string, number][]> {
  const content = await get(
    "https://www.piedmont.org/emergency-room-wait-times/emergency-room-wait-times"
  );
  const body = await content.text();

  const $ = cheerio.load(body);

  // Parse out the points spand and add them up.

  const records: any = [];
  // Parse out the comments
  const times = $("div[class=timeBox]")
    // @ts-ignore
    .each((i, v) => {
      const children = $(v).children().get();
      const id = $(children[0]).attr("id");
      const stream_id = id
        ?.replace(/^.*_lbl/, "")
        .replace(/([A-Z])/g, "_$1")
        .replace(/^_/, "")
        .toLowerCase();

      const minutes = parseInt($(children[0]).text(), 10);

      records.push([stream_id, minutes]);
    })
    .get();

  return records;
}

async function pushValues() {
  const records = await getStats();

  const writes = [];
  for (const [name, value] of records) {
    let config = await MicroWriterConfig.create({
      write_key: stream_write_keys[name],
    });
    const writer = new MicroWriter(config);
    console.log("Writing", name, value);
    writes.push(writer.set(`hospital-er-wait-minutes-${name}.json`, value));
  }
  await Promise.all(writes);
}

export const handler: ScheduledHandler<any> = async (event) => {
  console.log("Fetching data");
  await Promise.all([pushValues()]);
};

pushValues().catch((e) => console.error(e));
