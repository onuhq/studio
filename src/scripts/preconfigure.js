const fse = require('fs-extra')
const onu = require('@onuhq/node')

class DevClient extends onu.OnuClient {
  constructor() {
    super({
      apiKey: "sk_test_123",
      onuPath: process.env.ONU_PATH || "",
    })
  }

  async getAllTasks() {
    await this.init()
    return Object.keys(this.tasks).map((key) => {
      return {
        name: this.tasks[key].name,
        description: this.tasks[key].description,
        slug: this.tasks[key].slug,
        input: this.tasks[key].input,
        owner: this.tasks[key].owner,
      }
    })
  }
}

const devClient = new DevClient()

const main = async () => {
  await devClient.init()
  const tasks = await devClient.getAllTasks()
  // create the tasks.json file if it doesn't exist
  await fse.ensureFile('./tasks.json')
  fse.writeJSONSync('./tasks.json', tasks)
}

main();
