import { Task } from "@/types"
import { OnuClient } from "@onuhq/node"
process.env.ONU_INTERNAL__DEBUG_MODE = "true"

class DevClient extends OnuClient {
  constructor() {
    super({
      apiKey: "sk_test_123",
      onuPath: process.env.ONU_PATH || "",
    })
  }

  async getAllTasks(): Promise<Array<Task>> {
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

  async getTaskBySlug(slug: string) {
    await this.init()
    return this.tasks[slug];
  }
}

const devClient = new DevClient()

export default devClient;
