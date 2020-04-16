"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const utils_1 = require("ethers/utils");
const SimpleTwoPartySwapApp_json_1 = __importDefault(require("../../build/SimpleTwoPartySwapApp.json"));
const utils_2 = require("../utils");
const multiAssetMultiPartyCoinTransferEncoding = `
  tuple(address to, uint256 amount)[][]
`;
const swapAppStateEncoding = `tuple(
  ${multiAssetMultiPartyCoinTransferEncoding} coinTransfers
)`;
function mkAddress(prefix = "0xa") {
    return prefix.padEnd(42, "0");
}
const decodeAppState = (encodedAppState) => utils_1.defaultAbiCoder.decode([multiAssetMultiPartyCoinTransferEncoding], encodedAppState)[0];
const encodeAppState = (state, onlyCoinTransfers = false) => {
    if (!onlyCoinTransfers)
        return utils_1.defaultAbiCoder.encode([swapAppStateEncoding], [state]);
    return utils_1.defaultAbiCoder.encode([multiAssetMultiPartyCoinTransferEncoding], [state.coinTransfers]);
};
describe("SimpleTwoPartySwapApp", () => {
    let simpleSwapApp;
    async function computeOutcome(state) {
        return await simpleSwapApp.functions.computeOutcome(encodeAppState(state));
    }
    before(async () => {
        const wallet = (await utils_2.provider.getWallets())[0];
        simpleSwapApp = await new ethers_1.ContractFactory(SimpleTwoPartySwapApp_json_1.default.abi, SimpleTwoPartySwapApp_json_1.default.bytecode, wallet).deploy();
    });
    describe("update state", () => {
        it("can compute outcome with update", async () => {
            const senderAddr = mkAddress("0xa");
            const receiverAddr = mkAddress("0xB");
            const tokenAmt = new utils_1.BigNumber(10000);
            const ethAmt = new utils_1.BigNumber(500);
            const preState = {
                coinTransfers: [
                    [
                        {
                            amount: tokenAmt,
                            to: senderAddr,
                        },
                    ],
                    [
                        {
                            amount: ethAmt,
                            to: receiverAddr,
                        },
                    ],
                ],
            };
            const state = {
                coinTransfers: [
                    [
                        {
                            amount: ethAmt,
                            to: senderAddr,
                        },
                    ],
                    [
                        {
                            amount: tokenAmt,
                            to: receiverAddr,
                        },
                    ],
                ],
            };
            const ret = await computeOutcome(preState);
            utils_2.expect(ret).to.eq(encodeAppState(state, true));
            const decoded = decodeAppState(ret);
            utils_2.expect(decoded[0][0].to).eq(state.coinTransfers[0][0].to);
            utils_2.expect(decoded[0][0].amount.toString()).eq(state.coinTransfers[0][0].amount.toString());
            utils_2.expect(decoded[1][0].to).eq(state.coinTransfers[1][0].to);
            utils_2.expect(decoded[1][0].amount.toString()).eq(state.coinTransfers[1][0].amount.toString());
        });
    });
});
//# sourceMappingURL=simple-swap-app.spec.js.map