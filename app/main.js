const fs = require("fs");
const path = require("path");
const { deflateRawSync } = require("zlib");


const command = process.argv[2];
const flag = process.argv[3];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    const hash_code = process.argv[4];
    catFile(hash_code);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(path.join(process.cwd(), ".git", "HEAD"), "ref: refs/heads/main\n");
  console.log("Initialized git directory");
}

function catFile(hash_code){
  if (flag === '-p'){
    const content = fs.readFileSync(path.join(process.cwd(), ".git", "objects", hash_code.slice(0, 2), hash_code.slice(2)));
    const decompressed_data = zlib.deflateRawSync(content);
    const result = decompressed_data.toString().split("\x00")[1];

    process.stdout.write(result);
  } else {
    throw new Error(`Invalid Flag ${flag}`)
  }
}