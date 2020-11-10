#! /bin/bash

name="[AJAX-MAKER]"

if [ $? -eq 0 ]
then
  pkjV=$(grep \"version\" package.json)
  version=$(echo ${pkjV} | tr -cd "[0-9].")
  git add -A
  git commit -m "${name}: ${version}"
  git push origin master
  npm publish --registry=https://registry.npmjs.org/
  echo -e "\033[32m \n${name}:publish success: ${version}\n \033[0m"
else
  echo -e "\033[31m \n${name}:publish failed: ${version}\n \033[0m"
fi