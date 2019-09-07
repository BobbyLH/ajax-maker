#! /bin/bash

iterate=$1
name="[REQUEST-MAKER]"
dot="."

updateVersion () {
  versionLine=$(grep \"version\" package.json)
  version=$(echo ${versionLine} | tr -cd "[0-9].")
  prevSubVersion=$(echo ${version#*.})
  subVersion=$(echo ${prevSubVersion%.*})
  subSubVersion=$(echo ${version##*.})
  manualVersion=$(echo "$iterate" | grep [0-9]\.[0-9]\.[0-9])
  if [ "$iterate" = "i" -o "$iterate" = "ignore" ]
  then
    echo -e "\033[33m${name}: ignore version iteration\033[0m"
  elif [ -z "$iterate" ]
  then
    echo -e "\033[36m${name}: auto version iteration\033[0m"
    newSubSubVersion=`expr $subSubVersion + 1`
    newVersion=$(echo ${version/${dot}${subVersion}${dot}${subSubVersion}/${dot}${subVersion}${dot}${newSubSubVersion}})
    newVersionLine=$(echo "${versionLine/${version}/${newVersion}}")
    sed -i "" "s/${versionLine}/${newVersionLine}/g" "package.json"
  elif [ -n "$manualVersion" ]
    then
    echo -e "\033[35m${name}: manual version iteration - ${manualVersion}\033[0m"
    newVersion=$(echo ${version/${version}/${manualVersion}})
    newVersionLine=$(echo "${versionLine/${version}/${newVersion}}")
    sed -i "" "s/${versionLine}/${newVersionLine}/g" "package.json"
  else
    echo -e "\033[41;37m${name}: please input correct version number\033[0m"
    exit 1
  fi
}

updateVersion

if [ $? -eq 0 ]
then
  pkjV=$(grep \"version\" package.json)
  version=$(echo ${pkjV} | tr -cd "[0-9].")
  git add -A
  git commit -m "${name}: ${version}"
  git push
  echo -e "\033[32m \n${name}:release success: ${version}\n \033[0m"
else
  echo -e "\033[31m \n${name}:release failed: ${version}\n \033[0m"
fi