#!/bin/bash

# Make sure oh-my-zsh exists
if ! [ -d ~/.oh-my-zsh ]; then
  echo "oh-my-zsh not detected - installing now..."
  curl -L https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh | sh
fi

FILES="
gemrc
gitconfig
gitignore
zshrc
zprofile
irbrc
pryrc
rspec
aprc
oh-my-zsh/custom
tmux.conf
"

BIN="
git-pull-request
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

