import json
import argparse


from flure.parser.dwarf import DwarfParser
from flure.parser.reflutter import ReFlutterDumpParser


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Parse and reformat snapshot information")
    parser.add_argument("input", help="Input file to parse")
    parser.add_argument("-o", "--output", help="Output file")

    args = parser.parse_args()
    parser = ReFlutterDumpParser(args.input)
    if args.output is not None:
        with open(args.output, 'w') as fp:
            json.dump(parser.code_info.dump(), fp, indent=4)
    else:
        print(json.dumps(parser.code_info.dump(), indent=4))
