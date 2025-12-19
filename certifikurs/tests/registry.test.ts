
import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("registry contract", () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe("initialization", () => {
    it("sets deployer as super-admin", () => {
      const { result } = simnet.callReadOnlyFn(
        "registry",
        "get-super-admin",
        [],
        deployer
      );
      expect(result).toBePrincipal(deployer);
    });

    it("sets deployer as initial active-manager", () => {
      const { result } = simnet.callReadOnlyFn(
        "registry",
        "get-active-manager",
        [],
        deployer
      );
      expect(result).toBePrincipal(deployer);
    });
  });

  describe("set-active-manager", () => {
    it("allows super-admin to set active manager", () => {
      const { result } = simnet.callPublicFn(
        "registry",
        "set-active-manager",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify the manager was updated
      const manager = simnet.callReadOnlyFn(
        "registry",
        "get-active-manager",
        [],
        deployer
      );
      expect(manager.result).toBePrincipal(wallet1);
    });

    it("fails when non-admin tries to set manager", () => {
      const { result } = simnet.callPublicFn(
        "registry",
        "set-active-manager",
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });
  });

  describe("change-super-admin", () => {
    it("allows current super-admin to transfer ownership", () => {
      const { result } = simnet.callPublicFn(
        "registry",
        "change-super-admin",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify the admin was changed
      const admin = simnet.callReadOnlyFn(
        "registry",
        "get-super-admin",
        [],
        deployer
      );
      expect(admin.result).toBePrincipal(wallet1);
    });

    it("fails when non-admin tries to change admin", () => {
      const { result } = simnet.callPublicFn(
        "registry",
        "change-super-admin",
        [Cl.principal(wallet2)],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });

    it("fails when trying to set same admin", () => {
      const { result } = simnet.callPublicFn(
        "registry",
        "change-super-admin",
        [Cl.principal(deployer)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
    });
  });
});
