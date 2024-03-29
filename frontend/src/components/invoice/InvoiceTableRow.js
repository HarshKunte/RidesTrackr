import React, { Fragment } from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const borderColor = '#3778C2'
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: '#3778C2',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        fontStyle: 'bold',
    },
    description: {
        width: '70%',
        textAlign: 'left',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        paddingLeft: 8,
    },
    amount: {
        width: '30%',
        textAlign: 'right',
        paddingRight: 8,
    },
});

const InvoiceTableRow = ({invoice}) => {
    const rows = invoice.items.map(item =>{
        if(item.sno === 2 && invoice.charged_lumpsum){
            return
        }
        if(item.sno === 6 && !invoice.charged_lumpsum){
            return
        }
        return(
        <View style={styles.row} key={item.sno.toString()}>
            <Text style={styles.description}>{item.desc}</Text>
            <Text style={styles.amount}>{item.qty}</Text>
        </View>)
});
    return (<Fragment>{rows}</Fragment>)
};

export default InvoiceTableRow;