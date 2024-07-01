const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");


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
  case "hash-object":
    const file_name = process.argv[4];
    hashObject(file_name);
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
    const decompressed_data = zlib.inflateSync(content);
    const result = decompressed_data.toString().split("\x00")[1];

    process.stdout.write(result);
  } else {
    throw new Error(`Invalid Flag ${flag}`)
  }
}

function hashObject (file_name) {
  if(flag === '-w') {
    const { size } = fs.statSync(file_name);
    const data = fs.readFileSync(path.join(process.cwd(), file_name)).toString();
    const content = `blob ${size}\0${data}`;
    const hash = crypto.createHash("sha1").update(content).digest("hex");
    process.stdout.write(hash); 
    
    const directory_path = `${process.cwd()}/.git/objects/${hash.slice(0,2)}}`
    if(!fs.existsSync(directory_path)){
      fs.mkdirSync(directory_path, {recursive: true,}); 
    }
  
    const compressed_data = zlib.deflateSync(content);
    fs.writeFileSync(`${directory_path}/${hash.slice(2)}`, compressed_data)
  }  
}