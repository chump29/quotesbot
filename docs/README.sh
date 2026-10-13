#!/usr/bin/env -S bash -e

export _user=chump29
export _repo=quotesbot

echo -e "📌 Packages:\n"

_bun=$(bun --version)
export _bun
echo -e " • Bun: $_bun"

_discord=$(jq -r '.dependencies."discord.js" // "❓"' ../package.json)
export _discord
echo -e " • discord.js: $_discord"

echo -e "\n🧪 Running tests…"
bun run test:coverage

_coverage=0
if [ -f "../tests/coverage/lcov.info" ]; then
  _coverage=$(bun run --bun lcov-total ../tests/coverage/lcov.info)
fi
export _coverage
echo -e "\n☂️  Coverage: $_coverage%"

echo -e "\n🛠️  Creating README.md..."

envsubst < README.template.md > ../README.md

echo -e "\n✔️  Done!\n"
