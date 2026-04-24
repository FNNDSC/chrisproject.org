{
  description = "pnpm development environment for chrisproject.org website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        lib = pkgs.lib;
        fhs = pkgs.buildFHSEnv ({
          name = "pnpm";
          targetPkgs = pkgs: with pkgs; [
            pnpm
            nodejs-slim_24
          ];
        } // (
        let
          runScript = "${builtins.getEnv "SHELL"}";
        in lib.optionalAttrs (runScript != "") {
          inherit runScript;
        }));
      in {
        devShells.default = fhs.env;
      });
}
