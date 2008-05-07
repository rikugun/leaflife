package leaflife.widget.jsrpc.serializer;

import java.beans.PropertyDescriptor;
import java.io.EOFException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.logging.Logger;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.JSONSerializable;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.MethodIntrospector;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Object and JSON string.
 * @author huangchao
 */
public class ObjectSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {Object.class};
    private transient static Logger logger = Logger.getLogger(ObjectSerializer.class.getName());

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public String marshall(Object obj, int level) throws MarshallException
    {
        if (obj instanceof JSONSerializable)  // invoke custom serialization method
        {
            return ((JSONSerializable) obj).toJSONString();
        }
        ++ level;
        StringBuffer result = new StringBuffer("{");
        PropertyDescriptor[] prop_descs = MethodIntrospector.getReadMethods(obj);  // retrieve all getters
        for (int i = 0; i < prop_descs.length; ++ i)
        {
            PropertyDescriptor prop_desc = prop_descs[i];
            Method method = prop_desc.getReadMethod();  // getter
            String method_name = method.getName();
            try
            {
                Object value = method.invoke(obj, null);
                if (value != null)
                {
                    Serializer serializer = serializer_factory.getSerializer(value.getClass());
                    // stop marshalling object and array when reach the max marshall level
                    if (serializer.canMarshall(level))
                    {
                        result.append(prop_desc.getName()).append(":").append(serializer.marshall(value, level)).append(",");
                    }
                }
            }
            catch (IllegalArgumentException e)
            {
                logger.warning("Ignore getter \"" + method_name + "\" for " + e.getMessage());
            }
            catch (IllegalAccessException e)
            {
                logger.warning("Ignore getter \"" + method_name + "\" for " + e.getMessage());
            }
            catch (InvocationTargetException e)
            {
                logger.warning("Ignore getter \"" + method_name + "\" for " + e.getMessage());
            }
        }
        if (result.length() > 1)
        {
            result.deleteCharAt(result.length() - 1);  // delete last ","
        }
        result.append("}");
        return result.toString();
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        Object result = null;
        try
        {
            do
            {
                switch (json.nextToken())
                {
                    case Tokener.NULL:  // null
                    {
                        return null;
                    }
                    case Tokener.START_OBJECT:
                    {
                        result = desired_class.newInstance();
                        // check the syntax of object properties
                        switch (json.nextToken())
                        {
                            case Tokener.END_OBJECT:  // empty object
                            {
                                return result;
                            }
                            case Tokener.COMMA:
                            case Tokener.COLON:
                            {
                                throw new InvalidJSONSyntaxException("108");  // object should be composed of name-value pairs
                            }
                            default:
                            {
                                json.lastToken();  // back to last token
                            }
                        }
                    }
                    case Tokener.COMMA:  // ","
                    {
                        if (result == null)
                        {
                            throw new InvalidJSONSyntaxException("105");  // object should start with "{"
                        }
                        else  // parse the next name-value pair
                        {
                            unmarshallPair(json, result);
                            break;
                        }
                    }
                    case Tokener.END_OBJECT:
                    {
                        if (result == null)
                        {
                            throw new InvalidJSONSyntaxException("105");  // object should start with "{"
                        }
                        else
                        {
                            return result;
                        }
                    }
                    default:
                    {
                        throw new UnmarshallException("105");  // object should start with "{"
                    }
                }
            }
            while (true);
        }
        catch (EOFException e)
        {
            throw new InvalidJSONSyntaxException("106");  // object should end with "}"
        }
        catch (InstantiationException e)
        {
            throw new InvocationException("304");  // can not instantiate the specified class (nullary constructor, interface or abstract class)
        }
        catch (IllegalAccessException e)
        {
            throw new InvocationException("308");  // accessing to the the specified class is denied
        }
    }

    /**
     * Converts a name-value pair to a object property.
     * @param json the JSON string to be converted
     * @param obj the Java object being parsed
     * @return false if there is no name-value pair left, true otherwise
     * @throws EOFException if there is no valid character left
     * @throws InvalidJSONSyntaxException if the syntax JSON string is invalid
     * @throws UnmarshallException if the JSON string cannot be converted to the Java object specified
     */
    private void unmarshallPair(Tokener json, Object obj) throws EOFException, InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        if (json.nextToken() == Tokener.STRING)  // name
        {
            String name = json.getTokenText();
            Method setter = MethodIntrospector.getWriteMethod(obj, name);  // setter method
            if (json.nextToken() == Tokener.COLON)  // name-value pair separator (":")
            {
                if (setter == null)  // ignore the value
                {
                    logger.warning("Ignore JSON name-value pair \"" + name + "\" for no setter found");
                    skipValue(json);
                }
                else  // unmarshall the value
                {
                    Class cls = setter.getParameterTypes()[0];
                    Serializer serializer = serializer_factory.getSerializer(cls);
                    Object value = serializer.unmarshall(json, cls);
                    if (value != null)
                    {
                        try
                        {
                            // invoke the setter
                            setter.invoke(obj, new Object[] {value});
                        }
                        catch (IllegalArgumentException e)
                        {
                            logger.warning("Ignore JSON name-value pair \"" + name + "\" for " + e.getMessage());
                        }
                        catch (IllegalAccessException e)
                        {
                            logger.warning("Ignore JSON name-value pair \"" + name + "\" for " + e.getMessage());
                        }
                        catch (InvocationTargetException e)
                        {
                            logger.warning("Ignore JSON name-value pair \"" + name + "\" for " + e.getMessage());
                        }
                    }
                }
                return;
            }
            else
            {
                throw new InvalidJSONSyntaxException("107");  // name-value pair should separate with ":"
            }
        }
        else
        {
            throw new InvalidJSONSyntaxException("108");  // object should be composed of name-value pairs
        }
    }

    private void skipValue(Tokener json) throws EOFException, InvalidJSONSyntaxException
    {
        StringBuffer pairs = new StringBuffer();
        do
        {
            switch (json.nextToken())
            {
                case Tokener.START_OBJECT:
                case Tokener.START_ARRAY:
                {
                    pairs.append(json.getTokenText());
                    break;
                }
                case Tokener.END_OBJECT:
                {
                    if (pairs.length() > 0 && pairs.charAt(pairs.length() - 1) == '{')
                    {
                        pairs.deleteCharAt(pairs.length() - 1);
                    }
                    else
                    {
                        throw new InvalidJSONSyntaxException("106");
                    }
                }
                case Tokener.END_ARRAY:
                {
                    if (pairs.charAt(pairs.length() - 1) == '[')
                    {
                        pairs.deleteCharAt(pairs.length() - 1);
                        break;
                    }
                    else
                    {
                        throw new InvalidJSONSyntaxException("110");
                    }
                }
                default:
                {
                    if (pairs.length() == 0)
                    {
                        return;
                    }
                    break;
                }
            }
        }
        while (true);
    }
}
