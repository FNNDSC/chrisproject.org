{
  description = "pnpm development environment for chrisproject.org website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        fhs = pkgs.buildFHSEnv {
          name = "corepack";
          targetPkgs = pkgs: with pkgs; [
            corepack
          ];
        };
      in {
        devShells.default = fhs.env;
      });
}
