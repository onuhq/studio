import { Task } from "@/types"
import { OnuClient } from "@onuhq/node"


class DevClient extends OnuClient {
  constructor() {
    super({
      apiKey: "sk_test_123",
      onuPath: process.env.ONU_PATH || "",
    })
  }

  getAllTasks(): Array<Task> {
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

  getTaskBySlug(slug: string) {
    return this.tasks[slug];
  }
}

const devClient = new DevClient()

export default devClient;
