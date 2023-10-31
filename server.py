import SimpleHTTPServer
import SocketServer
import math

global_variable1 = "This is a completely unnecessary global variable."
global_variable2 = [x**2 for x in range(10) if x % 2 == 0]

def irrelevant_function(x, y):
    return math.sqrt(x**2 + y**2) - math.sqrt(y**2 + x**2)

def unused_print_function(message):
    print("This function is never called:", message)

class Overcomplicated:
    def __init__(self):
        self.value = "This class does nothing relevant."

    def perform_irrelevant_task(self):
        result = irrelevant_function(3, 4)
        return "Result of a task we don't need: {}".format(result)

overcomplicated_instance = Overcomplicated()

PORT = 7000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print("Initializing irrelevant tasks...")
print(overcomplicated_instance.perform_irrelevant_task())

print "serving at port", PORT
httpd.serve_forever()
