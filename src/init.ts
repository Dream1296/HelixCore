import { solarEnergyData } from "./services/solarEnergy";

export function systemInit() {
    setTimeout(() => {
        solarEnergyData();
    }, 3000);

    if (!process.env.aNew) {

        return new Error('环境变量aNuw错误');
        process.exit(-1);
    }




}