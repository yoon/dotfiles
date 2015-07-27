# Aliases for speed
alias cd..='cd ..'
alias g='git'
alias be='bundle exec'

# Tell ls to be colourful
alias ls="ls -G"

# Tell grep to highlight matches
export GREP_OPTIONS='--color=auto'

# locale
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

if [ "$BASH" ]; then
  . ~/.bashrc
fi
