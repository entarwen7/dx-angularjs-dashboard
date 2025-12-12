(function () {
    'use strict';

    angular
        .module('myAppDashboard', [])
        .controller('MainCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
            $scope.items = [];
            $scope.selected = null;
            $scope.searchText = '';

            $scope.chartOptions = {
                dataSource: [],
                commonSeriesSettings: {
                    argumentField: 'producto',
                    type: 'bar'
                },
                series: [
                    { valueField: 'precio', name: 'Precio' }
                ],
                title: 'Precio por producto',
                tooltip: { enabled: true }
            };

            $scope.gridOptions = {
                dataSource: 'items',
                columns: [
                    { dataField: 'id', caption: 'ID' },
                    { dataField: 'producto', caption: 'Producto' },
                    { dataField: 'categoria', caption: 'Categoria' },
                    { dataField: 'precio', caption: 'Precio', dataType: 'number', format: { style: 'currency', currency: 'USD' } },
                    {
                        dataField: 'stock',
                        caption: 'Inventario',
                        width: 110,
                        cellTemplate: function (container, options) {
                            var val = options.data.stock;
                            var span = $("<span>").text(val).addClass(val < 20 ? 'low-stock' : 'ok-stock');
                            container.append(span);
                        }
                    }
                ],

                paging: { pageSize: 10 },
                pager: { showPageSizeSelector: true, allowedPageSizes: [5, 10, 20], showInfo: true },
                filterRow: { visible: true },
                selection: { mode: 'single' },
                onSelectionChanged: function (e) {
                    var data = e.selectedRowsData && e.selectedRowsData[0];
                    if (data) {
                        $scope.selected = data;
                        $scope.chartOptions.dataSource = [data];
                    } else {
                        $scope.selected = null;
                        $scope.chartOptions.dataSource = $scope.items;
                    }

                    $scope.$applyAsync();
                },

                onContentReady: function (e) {
                }
            };


          
            $http.get('src/data.json').then(function (res) {
                $scope.items = res.data || [];

                $scope.chartOptions.dataSource = $scope.items;

                if ($scope.gridOptions && $scope.gridOptions.dataSource === 'items') {
                    $scope.gridOptions.dataSource = $scope.items;
                }

                $timeout(function () {
                    try {
                        var $div = $('#grid'); 
                        if (!$div.length) {
                            console.warn('Selector #grid no encontrado al inicializar (app.js)');
                            return;
                        }
                       
                        if ($div.hasClass('dx-datagrid')) {
                            try {
                                var inst = $div.dxDataGrid('instance'); 
                                inst.option('dataSource', $scope.items);
                                console.log('dxDataGrid actualizado con nuevos datos (app.js via $timeout)');
                            } catch (errInst) {
                                console.warn('No se pudo obtener instancia dxDataGrid aun cuando existe la clase:', errInst);
                            }
                        } else {
                           
                            try {
                                $div.dxDataGrid($scope.gridOptions);
                                console.log('dxDataGrid inicializado desde app.js (via $timeout)');
                            } catch (errInit) {
                                console.error('Error inicializando dxDataGrid (primera vez):', errInit);
                            }
                        }


                    } catch (err) {
                        console.warn('Error inicializando dxDataGrid desde app.js:', err);
                    }
                }, 50); 
            }, function (err) {
                console.error('Error cargando src/data.json', err);
            });


            $scope.$watch('searchText', function (newVal) {
                var instance = $('.dx-datagrid').dxDataGrid('instance');
                if (instance) {
                    if (newVal && newVal.length) {
                        instance.filter(['producto', 'contains', newVal]);
                    } else {
                        instance.clearFilter();
                    }
                }
            });
        }]);
})();

