import fs from "fs";

const processPid = () => {
  const pid = "process.pid";
  fs.writeFileSync(pid, process.pid.toString(), { flag: "w+" });
  process.on("SIGINT", () => {
    if (fs.existsSync(pid)) {
      fs.unlinkSync(pid);
    }
    process.exit(1);
  });
};

export default processPid;
