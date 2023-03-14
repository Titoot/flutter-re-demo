import re
from flure.code_info import CodeInfo, ClassInfo, FunctionInfo

CLASS_TOKEN = b"class "
FUNCTION_TOKEN = b"    "
#    _Uint8ArrayView@7027147 _Uint8ArrayView@7027147._@7027147(DynamicType, _TypedList@7027147, int, int) {
FUNCTION_REGEX = r"\s{4}(.+?)\s(.+?)\((.+?|)\)\s{"
OFFSET_REGEX = r"\s{8}.+?(\w*)\\r\\n"
KNOWN_PREFIXES_IGNORED = [b"Random ", b"Map<Object, ", b"Class: ", b"dynamic ", b'', b'}']


class ReFlutterDumpParser(object):
    def __init__(self, filename):
        self.filename = filename
        self.code_info = CodeInfo()
        self.parse()

    def parse(self):
        with open(self.filename, "rb") as fp:
            lines = fp.readlines()
        cur_line_index = 0
        while cur_line_index < len(lines):
            if lines[cur_line_index].startswith(CLASS_TOKEN):
                class_info, next_line_index = self.parse_class(lines, cur_line_index)
                self.code_info.add_classes(class_info)
                cur_line_index = next_line_index
            else:
                raise Exception(f"Unknown line while parsing file: {lines[cur_line_index].strip()}")

    def parse_class(self, lines, start_index):
        class_info = self.parse_class_declaration_line(lines[start_index])
        cur_line_index = start_index + 1
        while cur_line_index < len(lines):
            if lines[cur_line_index].startswith(CLASS_TOKEN):
                return class_info, cur_line_index
            elif re.search(FUNCTION_REGEX,str(lines[cur_line_index])):
                func_info = self.parse_function_lines(lines[cur_line_index:cur_line_index + 4])
                class_info.add_function(func_info)
                cur_line_index += 4
            else:
                prefix_found = False
                for known_ignored_prefix in KNOWN_PREFIXES_IGNORED:
                    if lines[cur_line_index].strip().startswith(known_ignored_prefix):
                        cur_line_index += 1
                        prefix_found = True
                        break
                if not prefix_found:
                    raise Exception(f"Unknown line while parsing class: {lines[cur_line_index].strip()}")
        return class_info, cur_line_index

    @staticmethod
    def parse_class_declaration_line(line):
        if not line.startswith(CLASS_TOKEN):
            raise Exception(f"Invalid line while parsing class declaration line: '{line}'")
        class_name = line.split(b" ")[1].decode("ascii")
        #class_full_declaration = line.split(b"'")[2].strip()
        #if not class_full_declaration.startswith(CLASS_TOKEN):
        return ClassInfo(":", class_name, None)
        #class_name = class_full_declaration[len(CLASS_TOKEN):].split(b" ")[0].decode("ascii")
        #return ClassInfo(module_path, class_name, class_full_declaration[:-1].decode("ascii"))

    @staticmethod
    def parse_function_lines(func_lines):
        if (func_lines[2].strip() != b'}') or not (func_lines[3] != b'}\r\n' or func_lines[3] != b'\r\n'):
            raise Exception(f"Invalid lines while parsing function declaration line: '{func_lines}'")

        # _Uint8ArrayView@7027147 _Uint8ArrayView@7027147._@7027147(DynamicType, _TypedList@7027147, int, int)
        func_info = re.search(FUNCTION_REGEX,str(func_lines[0]))
        func_returnType = func_info.group(1)
        func_name = func_info.group(2)
        #func_signature = func_info.group(3)
        func_args = func_info.group(3)
        # Code at absolute offset: 0x2ba4c0
        offset_info = re.search(OFFSET_REGEX, str(func_lines[1]))
        func_offset = offset_info.group(1)
        #func_relative_base = func_lines[2].strip().split(b"+")[0].split(b":")[1].strip().decode("ascii")
        return FunctionInfo(func_returnType, func_name, int(func_offset, 16))