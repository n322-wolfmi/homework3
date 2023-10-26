import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import {
  Button,
  Appbar,
  Modal,
  TextInput,
  List,
  IconButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [visible, setVisible] = useState();
  const [listName, setListName] = useState();
  const [lists, setLists] = useState([]); //stores lists, updated from storage
  const hideModal = () => setVisible(false);
  const showModal = () => setVisible(true);

  //adds a list to local storage
  const addList = async () => {
    let listArray = [];
    let listObj = { name: listName, items: [] };

    if(lists.length != 0) { //if lists are in storage
      listArray = lists //get the list from storage
      listArray.push(listObj) //push new list object to the array 
      console.log("Adding list:", listArray)
    } else { //if empty storage
      listArray.push(listObj) //push new list object to the array 
      console.log("Adding list:", listArray)
      hideModal();
    }

    try {
      //set new list array to storage using key of 'lists'
      await AsyncStorage.setItem('lists', JSON.stringify(listArray)); 
    } catch(e) {
      console.log(e)
    }
    getStorage(); //get storage to update screen
    hideModal();
  };

  //filter list out of state and storage
  const deleteList = async (filtered) => {
    setLists(filtered) //update state
    await AsyncStorage.setItem('lists', JSON.stringify(filtered)); //update storage
  };

  //get items every initial load of page
  const getStorage = async () => {
    try {
      //get storage array using key lists
      const listStorage = await AsyncStorage.getItem('lists');
      const parsed = JSON.parse(listStorage)
      
      if (parsed.length === 0) {
        console.log('No lists available');
      } else {
        console.log("Getting lists:", parsed)
        setLists(parsed); //set storage array to state and parse it
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getStorage(); //on every startup load, pull storage
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title={'List App'} />
        <Appbar.Action icon="plus-circle-outline" onPress={showModal} />
      </Appbar.Header>

      <View style={styles.lists}>
        {lists.map((list, idx) => {
          return (
            <List.Item style={styles.items}
              title={list.name}
              onPress={() => navigation.navigate('List Details', idx)}
              right={() => (
                <IconButton
                  onPress={() => {
                    //call delete function and pass filtered list over
                    deleteList(lists.filter((a) => a.name !== list.name));
                  }}
                  icon="delete"
                  size={20}
                />
              )}
            />
          );
        })}
      </View>

      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.modalStyle}>
        <Text style={styles.paragraph}>Add new list name here.</Text>
        <TextInput label="Add List Name!" onChangeText={setListName} />
        <Button mode="contained" color="#2873ed" onPress={addList}>
          Add New List
        </Button>
        <Button color="#2873ed" onPress={hideModal}>
          Cancel
        </Button>
      </Modal>
    </SafeAreaView>
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
    backgroundColor: '#45d07d',
    fontFamily: 'Gill Sans'
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
  }
});
