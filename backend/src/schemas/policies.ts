import { Ctx, Query, Resolver } from "type-graphql";
import { policies } from "../configs/constants";
import Context from "../configs/context";
import logger from "../utils/logger";
import Policy from "../types/policy";

@Resolver()
export default class Policies {
  @Query(() => [Policy])
  async policies(@Ctx() ctx?: Context): Promise<Policy[]> {
    ctx && (await ctx.hasPermission(policies.policies, false));

    try {
      let policyModules: Policy[] = [];
      for (const [key, value] of Object.entries(policies)) {
        const exp = value.split(":");
        const claim_type = exp[0];
        if (!policyModules.map((e) => e.module).includes(claim_type)) {
          policyModules.push({ module: claim_type, policies: [] });
        }
      }

      for (const [key, value] of Object.entries(policies)) {
        const exp = value.split(":");
        const claim_type = exp[0];
        const claim_value = exp[1];
        for (const policyModule of policyModules) {
          if (
            claim_type === policyModule.module &&
            !policyModule.policies.includes(claim_value)
          ) {
            policyModule.policies.push(claim_value);
          }
        }
      }

      return policyModules;
    } catch (err) {
      logger(err, "error");
      return err;
    }
  }
}
