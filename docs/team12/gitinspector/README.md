# Gitinspector

## Analisi generale
```
gitinspector --format=html --timeline --responsibilities --metrics --weeks --list-file-types --file-types=js,jsx,css > statistics_all.html
```

## Analisi senza test
```
gitinspector --format=html --timeline --responsibilities --metrics --weeks --list-file-types --file-types=js,jsx,css --exclude="(test\.js|test\.jsx)$" > statistics_feature.html
```

## Analisi solo test
```
gitinspector --format=html --timeline --responsibilities --metrics --weeks --list-file-types --file-types=js,jsx --exclude=".*((?<!\.test\.js)(?<!\.test\.jsx))$" > statistics_test.html
```