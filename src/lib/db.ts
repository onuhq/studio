import Cache from "file-system-cache";

const cache = Cache({
  basePath: "./devCache", // Path where cache files are stored
});

export default cache;
