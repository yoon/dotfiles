#!/bin/bash

# Set up directories
mkdir -p ~/.config/git

FILES="
gemrc
config/git/attributes
gitconfig
gitignore
irbrc
powconfig
profile
pryrc
rspec
vimrc
"

BIN="
resolve-schema
"

# Create symbolic links for all configuration files
for file in $FILES
do
  SOURCE="$HOME/dotfiles/$file"
  TARGET="$HOME/.$file"

  # Create backup file if the target already exists and is not a symlink
  if [ -e "$TARGET" ] && [ ! -L "$TARGET" ]; then
    echo "*** WARNING *** $TARGET already exists - copying original to .$file.old"
    mv "$TARGET" "$TARGET.old"
  fi

  case $OSTYPE in
    darwin*)
      ln -hfsv "$SOURCE" "$TARGET"
      ;;
    linux*)
      ln -fsv "$SOURCE" "$TARGET"
      ;;
  esac
done

# Create symbolic links for all bin files
for file in $BIN
do
  SOURCE="$HOME/dotfiles/bin/$file"
  TARGET="/usr/local/bin/$file"

  # Create backup file if the target already exists and is not a symlink
  if [ -e "$TARGET" ] && [ ! -L "$TARGET" ]; then
    echo "*** WARNING *** $TARGET already exists - copying original to .$file.old"
    mv "$TARGET" "$TARGET.old"
  fi

  case $OSTYPE in
    darwin*)
      ln -hfsv "$SOURCE" "$TARGET"
      ;;
    linux*)
      ln -fsv "$SOURCE" "$TARGET"
      ;;
  esac
done

exit 0
