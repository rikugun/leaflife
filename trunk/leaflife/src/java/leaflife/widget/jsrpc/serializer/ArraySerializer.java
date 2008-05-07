package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;
import java.lang.reflect.Array;
import java.util.ArrayList;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Array and JSON string.
 * @author huangchao
 */
public class ArraySerializer extends AbstractSerializer
{
    public String marshall(Object obj, int level) throws MarshallException
    {
        ++ level;
        int len = Array.getLength(obj);
        StringBuffer result = new StringBuffer("[");
        for (int i = 0; i < len; ++ i)
        {
            Object element = Array.get(obj, i);
            if (element != null)
            {
                Serializer serializer = serializer_factory.getSerializer(element.getClass());
                if (serializer.canMarshall(level))
                {
                    result.append(serializer.marshall(element, level)).append(",");
                }
            }
        }
        if (result.length() > 1)
        {
            result.deleteCharAt(result.length() - 1);  // delete last ","
        }
        result.append("]");
        return result.toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        Class component_cls = desired_class.getComponentType();
        if (component_cls == null)
        {
            throw new UnmarshallException("201");  // can not convert JSON string to array object
        }
        ArrayList result = null;
        try
        {
            do
            {
                switch (json.nextToken())
                {
                    case Tokener.START_ARRAY:  // "["
                    {
                        result = new ArrayList();
                        // check the syntax of array elements
                        switch (json.nextToken())
                        {
                            case Tokener.END_ARRAY:  // empty array
                            {
                                return Array.newInstance(desired_class, 0);
                            }
                            case Tokener.COMMA:
                            case Tokener.COLON:
                            {
                                throw new InvalidJSONSyntaxException("114");  // array elements should separated by ","
                            }
                            default:
                            {
                                json.lastToken();  // back to last token
                            }
                        }
                    }
                    case Tokener.COMMA:  // ","
                    {
                        // unmarshall array elements
                        Serializer serializer = serializer_factory.getSerializer(component_cls);
                        Object value = serializer.unmarshall(json, component_cls);
                        if (value == null)
                        {
                            throw new UnmarshallException("115");  // array should be composed of elements
                        }
                        else if (result == null)
                        {
                            throw new UnmarshallException("114");  // array elements should separated by ","
                        }
                        else
                        {
                            result.add(value);
                            break;
                        }
                    }
                    case Tokener.END_ARRAY:  // "]"
                    {
                        if (result == null)
                        {
                            throw new InvalidJSONSyntaxException("109");  // array should start with "["
                        }
                        else
                        {
                            // build array of specified type
                            Object obj = Array.newInstance(component_cls, result.size());
                            try
                            {
                                for (int i = 0; i < result.size(); ++ i)
                                {
                                    Array.set(obj, i, result.get(i));
                                }
                            }
                            catch (IllegalArgumentException e)
                            {
                                throw new UnmarshallException("113");  // the type of array element is not the declared type
                            }
                            return obj;
                        }
                    }
                }
            }
            while (true);
        }
        catch (EOFException e)
        {
            throw new InvalidJSONSyntaxException("109");
        }
    }

    /**
     * Converts the JSON string to an object array.
     * @param json the JSON string to be converted
     * @param element_classes the element type of object array after convert
     * @return an object array of the JSON string
     * @throws InvalidJSONSyntaxException if the syntax JSON string is invalid
     * @throws UnmarshallException if the JSON string cannot be converted to a List object
     * @throws InvocationException if instantiating the specified class failed
     */
    public Object[] unmarshall(Tokener json, Class[] element_classes) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        ArrayList result = null;
        int idx = 0;
        try
        {
            do
            {
                switch (json.nextToken())
                {
                    case Tokener.START_ARRAY:  // "["
                    {
                        result = new ArrayList();
                        // check the syntax of array elements
                        switch (json.nextToken())
                        {
                            case Tokener.END_ARRAY:  // empty list
                            {
                                return null;
                            }
                            case Tokener.COMMA:
                            case Tokener.COLON:
                            {
                                throw new InvalidJSONSyntaxException("114");  // array elements should separated by ","
                            }
                            default:
                            {
                                json.lastToken();  // back to last token
                            }
                        }
                    }
                    case Tokener.COMMA:  // ","
                    {
                        // unmarshall array elements
                        Serializer serializer = serializer_factory.getSerializer(element_classes[idx]);
                        Object value = serializer.unmarshall(json, element_classes[idx ++]);
                        if (value == null)  // not support null elements
                        {
                            throw new UnmarshallException("115");  // array should be composed of elements
                        }
                        else if (result == null)
                        {
                            throw new UnmarshallException("114");  // array elements should separated by ","
                        }
                        else
                        {
                            result.add(value);
                            break;
                        }
                    }
                    case Tokener.END_ARRAY:  // "]"
                    {
                        if (result == null)
                        {
                            throw new InvalidJSONSyntaxException("109");  // array should start with "["
                        }
                        else
                        {
                            return result.toArray();
                        }
                    }
                }
            }
            while (true);
        }
        catch (EOFException e)
        {
            throw new InvalidJSONSyntaxException("109");
        }
    }
}
