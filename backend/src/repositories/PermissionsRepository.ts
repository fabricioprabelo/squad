import { EntityRepository, Repository } from "typeorm";
import claims from "../configs/claims";
import Permission from "../types/Permission";

@EntityRepository(Permission)
class PermissionsRepository extends Repository<Permission> {
  getEntities(): Permission[] {
    let policyModules: Permission[] = [];
    for (const [key, value] of Object.entries(claims)) {
      const exp = value.split(":");
      const claim_type = exp[0];
      if (!policyModules.map((e) => e.module).includes(claim_type)) {
        policyModules.push({ module: claim_type, claims: [] });
      }
    }

    for (const [key, value] of Object.entries(claims)) {
      const exp = value.split(":");
      const claim_type = exp[0];
      const claim_value = exp[1];
      for (const policyModule of policyModules) {
        if (
          claim_type === policyModule.module &&
          !policyModule.claims.includes(claim_value)
        ) {
          policyModule.claims.push(claim_value);
        }
      }
    }
    return policyModules;
  }
}

export default PermissionsRepository;
