import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Appbar,
  Modal,
  TextInput,
  Button,
  List,
  IconButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DetailListScreen({ navigation, route }) {
  let listIdx = route.params; //index of selected list

  const [visible, setVisible] = useState();
  const [itemName, setItemName] = useState(); 
  const [currentName, setCurrentName] = useState();
  const [listItems, setListItems] = useState([]); //items array within object
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  //add an item to the list
  const addItem = async () => {
    let itemsArray = []
    let itemObj = { itemName: itemName }

    if(listItems.length != 0) { //if there are items in storage
      itemsArray = listItems //get all of the data from storage
      itemsArray.push(itemObj) //push new object into array
      console.log("Adding Item:", itemsArray);
    } else {
      itemsArray.push(itemObj) //push object into 
      console.log("Adding Items array:", itemsArray);
      hideModal();
    }

    try {
      const itemStorage = await AsyncStorage.getItem('lists'); //get all storage
      const parsed = JSON.parse(itemStorage) //parse returned array

      //change specific list's item array but keep storage array intact
      parsed[listIdx].items = itemsArray 
      
      await AsyncStorage.setItem('lists', JSON.stringify(parsed)) //set to storage
    } catch(e) {
      console.log(e)
    }
    getStorageItems();
    hideModal();
  };

  //remove an item from the list
  const deleteItem = async (filtered) => {
    setListItems(filtered) //update state
    const itemStorage = await AsyncStorage.getItem('lists'); //get all storage
    const parsed = JSON.parse(itemStorage) //parse returned array

    //change specific list's item array but keep storage array intact
    parsed[listIdx].items = filtered 
    await AsyncStorage.setItem('lists', JSON.stringify(parsed)) //set to storage
  };

  //push storage items to state array if available
  const getStorageItems = async () => {
    try {
      //get storage array using key 'lists'
      const itemStorage = await AsyncStorage.getItem('lists'); 
      const parsed = JSON.parse(itemStorage)
      setCurrentName(parsed[listIdx].name) //get list name for page title
      
      if (parsed[listIdx].items.length === 0) { 
        //if no items in storage, keep state empty
        console.log('No items in this list');
      } else {
        console.log("Getting items:", parsed[listIdx].items)
        setListItems(parsed[listIdx].items); //set storage array to state
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getStorageItems();
  }, [])

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Action
          icon="keyboard-backspace"
          onPress={() => navigation.navigate('Home')}
        />
        <Appbar.Content title={currentName + ' List'} />
        <Appbar.Action icon="plus-circle-outline" onPress={showModal} />
      </Appbar.Header>

      <View style={styles.lists}>
        {listItems.map((item) => (
          <List.Item style={styles.items}
            title={item.itemName}
            right={() => (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => {
                  deleteItem(listItems.filter((a) => a.itemName !== item.itemName));
                }}
              />
            )}
          />
        ))}
      </View>

      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modalStyle}>
        <Text style={styles.paragraph}>Add an item!</Text>
        <TextInput label="Add Item Name" onChangeText={setItemName} />
        <Button mode="contained" color="#2873ed" onPress={addItem}>
          Add New Item
        </Button>
        <Button color="#2873ed" onPress={hideModal}>
          Cancel
        </Button>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272623',
  },
  modalStyle: {
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    backgroundColor: '#edae25',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lists: {
    backgroundColor: '#EFEFF3',
  },
  items: {
    borderTopColor:'#272623',
    borderTopWidth:2,
    borderStyle:'solid'
  }
});
