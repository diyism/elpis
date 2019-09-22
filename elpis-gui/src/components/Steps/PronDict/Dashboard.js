import React, { Component } from 'react';
import { Button, Grid, Header, Segment, Table } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { pronDictLoad } from 'redux/actions/pronDictActions';
import { datasetLoad } from 'redux/actions/datasetActions';

import { pronDictList, pronDictGetLexicon } from 'redux/actions';
import arraySort from 'array-sort'
import Branding from 'components/Steps/Shared/Branding';
import Informer from 'components/Steps/Shared/Informer';
import NewForm from 'components/Steps/PronDict/NewForm';
import CurrentPronDictName from "./CurrentPronDictName";
import urls from 'urls';

class PronDictDashboard extends Component {

    state = {
        column: null,
        reverse: false
    }

    componentDidMount() {
        this.props.pronDictList()
    }

    handleSort = (clickedColumn, data) => () => {
        const { column } = this.state
        if (column !== clickedColumn) {
            this.setState({
                column: clickedColumn,
                reverse: false,
            })
            arraySort(data, clickedColumn, { reverse: false })
        } else {
            this.setState({
                reverse: ! this.state.reverse
            })
            arraySort(data, clickedColumn, { reverse: ! this.state.reverse })
        }
    }

    handleLoad = values => {
        const { pronDictLoad } = this.props
        const postData = { name: values.name }
        const datasetData = { name: values.dataset_name }
        pronDictLoad(postData, datasetData)
    }

    render() {
        const { t, name, list } = this.props;
        const listArray = Array.from(list.keys())
        const { column, direction } = this.state
        const listEl = list.length > 0 ? (
            <Table sortable celled fixed unstackable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={ column === 'name' ? direction : null }
                            onClick={ this.handleSort('name', listArray) }
                        >
                            Name
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Recordings
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                {
                    list.map( pronDict => {
                        const className = (pronDict.name === name) ? 'current' : ''
                        return (
                            <Table.Row key={pronDict.name }>
                                <Table.Cell>

                                    <Button
                                        className={className}
                                        fluid
                                        onClick={() => this.handleLoad(pronDict) }
                                        >{pronDict.name }</Button>
                                </Table.Cell>
                                <Table.Cell>
                                    {pronDict.dataset_name}
                                </Table.Cell>
                            </Table.Row>
                        )
                    })
                }
                </Table.Body>
            </Table>
        ) : <p>{ t('pronDict.dashboard.noneMessage') }</p>

        return (
            <div>
                <Branding />
                <Segment>
                    <Grid centered>
                        <Grid.Column width={ 4 }>
                            <Informer />
                        </Grid.Column>

                        <Grid.Column width={ 12 }>
                            <Header as='h1'>
                                { t('pronDict.dashboard.title') }
                            </Header>

                            <CurrentPronDictName />

                            {list.length == 0 &&
                                <NewForm />
                            }

                            {list.length > 0 &&
                                <>
                                    <Segment>
                                    <Button
                                        className='add'
                                        content={t('common.newButton')}
                                        labelPosition='left'
                                        icon='add'
                                        as={Link}
                                        to={urls.gui.pronDict.new} />
                                    </Segment>
                                    <Segment>
                                        {listEl}
                                    </Segment>
                                </>
                            }

                        </Grid.Column>
                    </Grid>
                </Segment>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        list: state.pronDict.pronDictList,
        name: state.pronDict.name
    }
}


const mapDispatchToProps = dispatch => ({
    pronDictList: () => {
        dispatch(pronDictList())
    },
    pronDictLoad: (pronDictData, datasetData) => {
        dispatch(pronDictLoad(pronDictData))
            .then((response)=>{
                console.log(response)
                console.log("pron dict loaded, now load the dataset", datasetData)
                dispatch(datasetLoad(datasetData))
            })
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(translate('common')(PronDictDashboard))
