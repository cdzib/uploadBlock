<?php
    class FileManager{
        private $request;
        public function __construct($request)
        {
            $this->request = $request;
        }
        public function errorNotFind()
        {
            
        }

        static public function upload($data = null)
        {
            if(!empty($_FILES['blob'])){  
                 try{
                    $data = $_FILES['blob']; //transforms the char array with the blob url to a string
                    $dir = $_POST['dir'];
                    $fname = $dir.'/'.$_POST['blockid'];
                    
                    if( isset($data) and !$data['error'] ){
                        //file_put_contents($fname, file_get_contents($data));
                        if(copy($data['tmp_name'], $fname)){
                            $response = array('success' => true, 'response' => 200, 'data' => $data);
                        }
                    }else{
                       $response = array('success' => true, 'response' => 200, 'data' => $data['error']);
                    }
                 
                }catch(Exception $e){
                    $response = array('success' => false, 'response' => 404, 'message' => $e->getMessage() );
                }  
            }
            if(isset($_POST['blocklist'])){
                try{
                    $blocklist = $_POST['blocklist'];
                    $dir = $_POST['dir'];
                    $list = new SimpleXMLElement($blocklist);
                    $cont = 0;
                    $cant = $list->count();
                    foreach ($list as $key => $value) {
                        $contents  = file_put_contents($dir.'/'.$_POST['filename'], file_get_contents($dir.'/'.$value), FILE_APPEND | LOCK_EX);
        
                        if (!unlink($dir.'/'.$value) && $contents !== false) 
                        { 
                          //echo ("$file_pointer cannot be deleted due to an error"); 
                        } 
                        else
                        { 
                          //echo ("$file_pointer has been deleted"); 
                            $cont = $cont + 1;
                        } 
                       
                    }
                    if ($cont == $cant) {
                      $response = array('success' => true, 'response' => 200);
                    }
                   
                   
                }catch(Exception $e){
                    $response = array('success' => false, 'response' => 404, 'message' => $e->getMessage() );
                }
            }
            return $response;
        }
    
    }

  