---
title: Installation
sidebar_position: 1
---

`chrs` is easy to install, and works on many platforms.

## Direct Download

You can download `chrs` from
[GitHub Releases](https://github.com/FNNDSC/chrs/releases).
Get the latest version here:

https://github.com/FNNDSC/chrs/releases/latest

This is the easiest installation method, however there is no
mechanism for automatic updates.

## Using Pip

Users who already have [Python](https://www.python.org/) can install `chrs` using `pip`.

```shell
pip install --user chrs
```

If necessary, add the `bin` folder to `$PATH`:

```shell
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## `cargo binstall`

[`cargo binstall`](https://github.com/cargo-bins/cargo-binstall) is a convenient
solution for installing pre-compiled binaries using the Rust `cargo` package manager.
First install cargo-binstall, then run

```shell
cargo binstall chrs
```

## Build from source

Use [cargo](https://doc.rust-lang.org/cargo/) to get and build the package from source, from crates.io:

```shell
cargo install --locked chrs
```

If necessary, add the `bin` folder to `$PATH`:

```shell
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Home Manager using Nix Flakes

Edit `~/.config/home-manager/flake.nix`

```nix
{
  description = "Home Manager configuration example";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    chrs.url = "github:FNNDSC/chrs";  # <-- add this line
  };

  outputs = { nixpkgs, home-manager, ... } @ inputs:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      homeConfigurations."chris@computer" = home-manager.lib.homeManagerConfiguration {
        inherit pkgs;
        modules = [
          ./packages.nix  # <-- file where chrs will be specified
        ];
        extraSpecialArgs = { inherit inputs; };  # <-- pass inputs to modules
      };
    };
}
```

And create the file `~/.config/home-manager/packages.nix` with the content:

```nix
{ lib, pkgs, inputs, ... }:

{
  home.packages = with pkgs; [
    inputs.chrs.packages.${system}.default
  ];
}
```

Run

```shell
cd ~/.config/home-manager
git add flake.nix packages.nix
nix flake update
git add flake.lock
home-manager switch
```
