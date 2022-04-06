import React, {Component} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import PropTypes from 'prop-types';
import {Dropdown} from 'primereact/dropdown';
import {Ripple} from 'primereact/ripple';
import {classNames} from 'primereact/utils';
import * as format from '../../helper/format';
import {MultiSelect} from 'primereact/multiselect';
import {FilterMatchMode, FilterOperator, updateLocaleOption} from 'primereact/api';
import DatatableHeaderView from './datatable-header-view';
import {Calendar} from 'primereact/calendar';


class DatatableView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first                     : 0,
            rows                      : 20,
            currentPage               : 1,
            result_column             : [],
            select_options            : [],
            result_filter             : {
                global: {
                    value    : null,
                    matchMode: FilterMatchMode.CONTAINS
                }
            },
            result_global_search_field: [],
            filters                   : null,
            filter_rules              : {
                'multi_select': {
                    value    : null,
                    matchMode: FilterMatchMode.IN
                },
                'date'        :
                    {
                        operator   : FilterOperator.AND,
                        constraints: [
                            {
                                value    : null,
                                matchMode: FilterMatchMode.DATE_AFTER
                            },
                            {
                                value    : null,
                                matchMode: FilterMatchMode.DATE_BEFORE
                            }
                        ]
                    }
            },
            selected_columns          : this.props.resultColumn,
            toggle_col_options          : this.props.resultColumn

        };

        this.onCustomPage       = this.onCustomPage.bind(this);
        this.bodyTemplateAmount = this.bodyTemplateAmount.bind(this);
        this.bodyTemplateDate   = this.bodyTemplateDate.bind(this);
        this.filterTemplate     = this.filterTemplate.bind(this);
        this.initFilters        = this.initFilters.bind(this);
        this.onColumnToggle     = this.onColumnToggle.bind(this);
    }

    componentDidMount() {
        this.generateResultColumn();
        this.initFilters();
        this.changeLocales();
    }

    changeLocales() {
        updateLocaleOption('matchAll', 'match all', 'en');
        updateLocaleOption('dateAfter', 'date is after', 'en');
        updateLocaleOption('dateBefore', 'date is before', 'en');
        updateLocaleOption('removeRule', 'remove rule', 'en');
        updateLocaleOption('matchAny', 'match any', 'en');
        updateLocaleOption('dateIs', 'date is', 'en');
        updateLocaleOption('dateIsNot', 'date is not', 'en');
        updateLocaleOption('apply', 'apply', 'en');
        updateLocaleOption('clear', 'clear', 'en');
    }

    onColumnToggle(event) {
        let selected_columns         = event.value;
        let ordered_selected_columns = this.state.toggle_col_options.filter(col => selected_columns.some(sCol => sCol.field === col.field));
        this.setState({
            selected_columns: ordered_selected_columns,
        }, () => {
            this.generateResultColumn();
        });

    }

    initFilters() {
        let result_col   = this.props.resultColumn;
        let filter       = {};
        let filter_rules = this.state.filter_rules;
        Object.keys(result_col).forEach(function(key) {
            if (result_col[key].filter_type) {
                filter[result_col[key].field] = filter_rules[result_col[key].filter_type];
            }
        });
        this.setState({
            result_filter: {
                ...this.state.result_filter,
                ...filter
            }
        });
    }

    clearFilters() {
        this.initFilters();
    }

    generateResultColumn() {
        const result_global_search_field = [];
        const result_column              = [];
        this.state.selected_columns.forEach((item, index) => {
            if (typeof (item.header) === 'undefined') {
                item.header = item.field.replaceAll('_', ' ');
            }

            if (typeof (item.sortable) === 'undefined') {
                item.sortable = true;
            }

            if (typeof (item.format) !== 'undefined' && item.format === 'amount') {
                item.body = (rowData) => this.bodyTemplateAmount(rowData, item.field);
            }

            if (typeof (item.format) !== 'undefined' && item.format === 'date') {
                item.body = (rowData) => this.bodyTemplateDate(rowData);
            }

            if (typeof (item.filter_type) !== 'undefined') {
                item.filter = true;
            }

            result_global_search_field.push(item.field);
            result_column.push(<Column
                key={index}
                field={item.field}
                header={item.header}
                filter={item.filter}
                filterField={item.field}
                dataType={item.data_type}
                filterElement={this.filterTemplate}
                showFilterMatchModes={item.match_mode}
                sortable={item.sortable}
                body={item.body}/>);
        });

        if (this.props.showActionColumn) {
            result_column.push(<Column
                key={'action'}
                field={'action'}
                header={'action'}
                sortable={false}/>);
        }

        this.setState({
            'result_column'             : result_column,
            'result_global_search_field': result_global_search_field
        });
    }

    onCustomPage(event) {
        this.setState({
            first: event.first,
            rows : event.rows
        });
    }

    bodyTemplateAmount(rowData, field) {
        return format.millix(rowData[field], false);
    }

    bodyTemplateDate(rowData) {
        return format.date(rowData.create_date);
    }

    getPaginatorTemplate() {
        return {
            layout               : 'RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
            'PrevPageLink'       : (options) => {
                return (
                    <button type="button" className={options.className}
                            onClick={options.onClick}
                            disabled={options.disabled}>
                        <span className="p-p-3">previous</span>
                        <Ripple/>
                    </button>
                );
            },
            'NextPageLink'       : (options) => {
                return (
                    <button type="button" className={options.className}
                            onClick={options.onClick}
                            disabled={options.disabled}>
                        <span className="p-p-3">next</span>
                        <Ripple/>
                    </button>
                );
            },
            'PageLinks'          : (options) => {
                if ((options.view.startPage === options.page && options.view.startPage !== 0) || (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
                    const className = classNames(options.className, {'p-disabled': true});

                    return <span className={className}
                                 style={{userSelect: 'none'}}>...</span>;
                }

                return (
                    <button type="button" className={options.className}
                            onClick={options.onClick}>
                        {options.page + 1}
                        <Ripple/>
                    </button>
                );
            },
            'RowsPerPageDropdown': (options) => {
                const dropdownOptions = [
                    {
                        label: 10,
                        value: 10
                    },
                    {
                        label: 20,
                        value: 20
                    },
                    {
                        label: 50,
                        value: 50
                    },
                    {
                        label: 100,
                        value: 100
                    },
                    {
                        label: 'all',
                        value: options.totalRecords
                    }
                ];

                return <div
                    className={'paginator-dropdown-wrapper'}>show<Dropdown
                    value={options.value} options={dropdownOptions}
                    onChange={options.onChange}/>records</div>;
            }
        };
    }

    getGroupedOptions(field) {
        return [...new Set(this.props.value.map(item => item[field]))];
    }

    getToggleSelect() {
        if (this.props.show_toggle_col) {
            return (
                <div style={{textAlign: 'left'}}>
                    <MultiSelect value={this.state.selected_columns} options={this.state.toggle_col_options} optionLabel="header" onChange={this.onColumnToggle}
                                 style={{width: '20em'}} panelHeaderTemplate={this.panelHeaderTemplate}/>
                </div>
            );
        }
    }

    panelHeaderTemplate(options) {
        return (
            <div className={'p-multiselect-header'}>
                {options.checkboxElement}
                <span className={'p-2'}>all</span>
                {options.closeElement}
            </div>
        );
    }

    filterTemplate(data) {
        let result = null;
        Object.keys(this.props.resultColumn).forEach((key) => {
            if (this.props.resultColumn[key].field === data.field && this.props.resultColumn[key].filter_type) {
                switch (this.props.resultColumn[key].filter_type) {
                    case 'multi_select':
                        result = (<MultiSelect value={data.value} options={this.getGroupedOptions(data.field)} itemTemplate={this.multiselectItemTemplate}
                                               onChange={(e) => {
                                                   data.filterCallback(e.value);
                                               }} optionLabel="label" placeholder="any"
                                               className="p-column-filter"/>);
                        break;
                    case 'date':
                        result = <Calendar value={data.value} onChange={(e) => data.filterCallback(e.value, data.index)} dateFormat="yy/mm/dd"
                                           placeholder="yyyy-mm-dd" mask="9999-99-99"/>;
                        break;
                    default:
                        result = (<MultiSelect value={data.value} options={this.getGroupedOptions(data.field)} itemTemplate={this.multiselectItemTemplate}
                                               onChange={(e) => data.filterCallback(e.value)} optionLabel="label" placeholder="any"
                                               className="p-column-filter"/>);
                        break;
                }
            }
        });
        return result;

    }


    multiselectItemTemplate(option) {
        return (
            <div className="p-multiselect-representative-option">
                <span className="image-text">{option}</span>
            </div>
        );
    }

    on_global_search_change(e) {
        const value                   = e.target.value;
        let result_filter             = {...this.state.result_filter};
        result_filter['global'].value = value;

        this.setState({
            result_filter,
            global_search_value: value
        });
    }

    render() {
        return (
            <>
                {this.getToggleSelect()}
                <DatatableHeaderView
                    reload_datatable={() => this.props.reload_datatable()}
                    datatable_reload_timestamp={this.props.datatable_reload_timestamp}
                    action_button_label={this.props.action_button_label}
                    action_button_on_click={this.props.action_button_on_click}
                    on_global_search_change={(e) => this.on_global_search_change(e)}
                />
                <DataTable value={this.props.value}
                           paginator
                           paginatorTemplate={this.getPaginatorTemplate()}
                           first={this.state.first}
                           rows={this.state.rows}
                           onPage={this.onCustomPage}
                           paginatorClassName="p-jc-end"
                           loading={this.props.loading}
                           stripedRows
                           showGridlines
                           resizableColumns
                           columnResizeMode="fit"
                           sortField={this.props.sortField}
                           sortOrder={this.props.sortOrder}
                           emptyMessage="no records found"

                           globalFilterFields={this.state.result_global_search_field}
                           filters={this.state.result_filter}
                           filterDisplay="menu"

                           responsiveLayout="scroll">
                    {this.state.result_column}
                </DataTable>
            </>
        );
    }
}


DatatableView.propTypes = {
    value                     : PropTypes.array.isRequired,
    resultColumn              : PropTypes.array.isRequired,
    sortField                 : PropTypes.string,
    sortOrder                 : PropTypes.number,
    showActionColumn          : PropTypes.bool,
    reload_timestamp          : PropTypes.any,
    loading                   : PropTypes.bool,
    datatable_reload_timestamp: PropTypes.any,
    action_button_icon        : PropTypes.string,
    action_button_label       : PropTypes.string,
    action_button_on_click    : PropTypes.func,
    reload_datatable          : PropTypes.func
};


export default DatatableView;
